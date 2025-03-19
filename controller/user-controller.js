const multer = require('multer')
const sharp = require('sharp')
const userModle = require('../models/user-model')
const tryCatchError = require('../utils/async-error')
const factory = require('./handler-factory')
const AppError = require('../utils/error')

// const multerStorage = multer.diskStorage({
//    destination: (req, file, cb) => {
//       cb(null, 'public/img/users')
//    },
//    filename: (req, file, cb) => {
//       const ext = file.mimetype.split('/')[1]//this will give us file extention
//       //file name will be like user-userid-date.jpg( or file extintion )
//       cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//    }
// })

//image will store is a buffer... this is usefull for image resizeing and much more
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      cb(null, true)
   } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false)
   }
}
const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})

// const upload = multer({ dest: 'public/img/users' })
exports.uploadUserPhoto = upload.single('photo')

//resize the user photo, if it is larger in size etc...
exports.resizeUserPhoto = tryCatchError(async (req, res, next) => {
   if (!req.file) return next()
   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
   await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`)
   next()
})

//filter object funtion 
const filterObj = (obj, ...allowedFields) => {
   const newObj = {}
   Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el]
   })
   return newObj
}



//get user by id
exports.creatUser = tryCatchError(async (req, res, next) => {

   // console.log("this rout does not working use singup insted");


   res.status(200).json({
      status: 'this rout does not work use singup instead',
      User
   })
})
//update the current user (updateMe)
exports.updateMe = tryCatchError(async (req, res, next) => {
   // console.log(req.file);

   // 1 create error if user post password or data
   if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError("This rout is not for updatepassword, do use /updateMe-password route", 404
      ))
   }
   // 2 filtered out unwanted filed....
   const filteredBody = filterObj(req.body, 'name', 'email');
   if (req.file) filteredBody.photo = req.file.filename
   // 3 update user document  
   const updateUser = await userModle.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true, runValidators: true
   })
   res.status(200).json({
      status: 'success',
      data: {
         user: updateUser
      }
   })
})

exports.getMe = (req, res, next) => {
   req.params.id = req.user.id
   next()
}

//delete this user or delete me
exports.deleteMe = tryCatchError(async (req, res, next) => {
   await userModle.findByIdAndUpdate(req.user.id, { active: false })

   res.status(204).json({
      status: "success",
      data: null
   })
})

exports.get_Allusers = factory.getAll(userModle)
exports.get_user = factory.getOne(userModle)
exports.updateUser = factory.updateOne(userModle)
exports.deleteUser = factory.deleteOne(userModle)

