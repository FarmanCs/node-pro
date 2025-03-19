const crypto = require('crypto')
const { promisify } = require('util')
const userModel = require("../models/user-model")
const jwt = require("jsonwebtoken")
const tryCatchError = require("../utils/async-error")
const AppError = require("../utils/error")
const Email = require('../utils/send-email')
// const sendEmail = require('../utils/send-email')

//sign token function
const signToken = id => {
   return jwt.sign({ id }, process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN })
}
//creat a function for sent token to clint or user
const creatSendToken = (user, statusCode, res) => {
   const token = signToken(user._id)
   const expirationTime = parseInt(process.env.JWT_COOKIE_EXPIRE_IN, 10)

   const cookieOptions = {
      expires: new Date(Date.now() + expirationTime * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'lax',   //  Safer for localhost
      secure: false      // Only set to true in production
   };
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

   //sending cookie
   res.cookie('jwt', token, cookieOptions)
   //this will hide the password from the user response
   user.password = undefined
   res.status(statusCode).json({
      status: 'success',
      token,
      user
   })
}
//singup or create new user
exports.singup = tryCatchError(async (req, res) => {
   const newUser = await userModel.create(req.body)
   const url = `${req.protocol}://${req.get('host')}/me`
   console.log(url);

   await new Email(newUser, url).sendWellcome()
   creatSendToken(newUser, 201, res)
})


//log in controller 
exports.login = tryCatchError(async (req, res, next) => {
   // 1) cheeck the email and password is correct or not or prestent or not
   const { email, password } = req.body
   // console.log(`Email is : ${email} while the password is ${password}`);

   if (!email || !password) {
      return next(new AppError("please provide the email and password", 400))
   }
   // 2) check the use with this email is present in db or not & the passowrd ok
   const user = await userModel.findOne({ email }).select('+password')
   // email.toLowerCase()
   //this will work the same as above 
   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorect passowrd or email", 401))
   }
   // 3) sen the token to the clinet and login message...
   creatSendToken(user, 200, res)
})

//Logged out 
exports.logout = (req, res) => {
   res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
   });
   res.status(200).json({ status: 'success' })
}

//auth middleware to for protection
exports.protect = tryCatchError(async (req, res, next) => {
   // 1) get token and check for existance
   let token;
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
      // console.log(token);
   } else if (req.cookies.jwt) {
      token = req.cookies.jwt
   }
   // console.log("Cookies toke: ", token);

   // console.log("token: revied: ", token);
   if (!token) {
      return next(new AppError("you are not login, please login to get access...", 401))
   }
   // 2) check the token vaidaton...
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
   // console.log(decoded)
   // 3) check for user is exist or not
   const createdUser = await userModel.findById(decoded.id)
   if (!createdUser) return next(new AppError('user no longer exist:', 401))

   // 4)    check if user chang the password after taken is genrated..
   // createdUser.changedPasswordAfter(decoded.iat)
   if (createdUser.changedPasswordAfter(decoded.iat)) {
      return next(
         new AppError("user recently change passowrd, please login agin", 401)
      )
   }
   req.user = createdUser
   res.locals.user = createdUser
   next()
})


//for rendring the franted pages authenticaiont
exports.isLoggedIn = async (req, res, next) => {
   // 1) get token and check for existance
   if (req.cookies.jwt) {
      try {
         // here we very the token from cookies
         const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
         )
         // 2) check the token vaidaton...
         const currentUser = await userModel.findById(decoded.id)
         if (!currentUser) {
            return next()
         }

         // 4)    check if user chang the password after taken is genrated..
         if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next()
         }
         //there is  logged in user
         res.locals.user = currentUser
         return next()
      } catch (error) {
         return next()
      }
   }
   next()
}



//restrection middleware for protection of some  action... 
exports.restrectTo = (...roles) => {
   return (req, res, next) => {
      //role is an arry of ['admin', 'lead-guide'] or 'user'
      if (!roles.includes(req.user.role)) {
         return next(new AppError('you do not have permission to perform this acction: ', 403))
      }
      next()
   }
}


//middleware for forgotpassowrd
exports.forgotPassword = tryCatchError(async (req, res, next) => {
   // 1) get user by email 
   const user = await userModel.findOne({ email: req.body.email })
   if (!user) {
      return next(new AppError("no user with this email", 404))
   }
   // 2) generate the random token and 
   const resetToken = user.createPasswordResetToken()
   await user.save({ validateBeforeSave: false })//search more about this thing
   // 3) send back to user
   // const resetURL = `${req.protocol}://${req.get(
   //    'host'
   // )}/api/v1/users/reset-Password/${resetToken}`
   // const message = `forgot your password submit patch request, with your new password and passwordConfirm to:  ${resetURL}. \n if you didn't forgot your password ignore this email`;
   try {
      // await Email({
      //    email: user.email,
      //    subject: 'your password rest token valid for 10',
      //    message
      // })
      //a new way to send email for rest password like we did  above (comment)
      const resetURL = `${req.protocol}://${req.get(
         'host'
      )}/api/v1/users/reset-Password/${resetToken}`
      await new Email(user, resetURL).sendPasswordReset()

      res.status(200).json({
         status: "success",
         message: 'token sent to email'
      })
   } catch (error) {
      console.log("ERROR: ", error);

      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError("there was an error sending email try agin latter", 500))
   }
})

//middleware for resetpassword
exports.resetPassword = tryCatchError(async (req, res, next) => {
   // 1) get user based on the token
   const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

   const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
   })
   // 2===> if token is not expired and there is a user, set new password
   if (!user) {
      return next(new AppError('token is invalid or has expired', 400))
   }
   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   user.passwordResetExpires = undefined
   user.passwordResetToken = undefined
   await user.save()

   // 3)  login user and sent JWT
   creatSendToken(user, 200, res)
})

exports.updatePassword = tryCatchError(async (req, res, next) => {
   // 1) check user form collection
   const user = await userModel.findById(req.user.id).select('+password')

   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError("your corrent password wrong ", 401))
   }
   // 2) check if POST corrent password is correct or not
   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   await user.save()
   // 3) log user and sent JWT
   creatSendToken(user, 200, res)
})

