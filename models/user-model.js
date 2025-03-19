const mongoose = require("mongoose")
const crypto = require("crypto")
const validator = require('validator')
const bcrypt = require('bcrypt')
// const { restrectTo } = require("../controller/auth-controller")

//name, email. password, photo, conformpassword
const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      maxLength: [50, 'name should not be longer then 50 character'],
      minLength: [4, "name should not be that much shorter..."]
   },
   email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'provide a valid email']
   },
   photo: {
      type: String,
      default: 'default.jpg'
   },
   role: {
      type: String,
      enum: ['user', 'guide', 'admin', 'lead-guide'],
      default: 'user'
   },
   password: {
      type: String,
      required: [true, 'please provide your password'],
      minlength: 8,
      maxlength: 62,
      select: false
   },
   passwordConfirm: { // Rename EVERYWHERE
      type: String,
      required: [true, 'please confirm your password'],
      validate: {
         validator: function (val) {
            return val === this.password;
         },
         message: 'Passwords do not match!' // Fix message
      }
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
   active: {
      type: Boolean,
      default: true,
      select: false
   }
})

//these are the mongose midelware work for updateing the passwords so it will casse issue while creating or adding new user so whenever you try to add new uese stop them while creating new user
userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next()
   this.passwordChangedAt = Date.now();
   next()
})

userSchema.pre('save', async function (next) {
   //only run the funciton if the password  is modified
   if (!this.isModified('password')) return next()
   //this will hash the password & stor it into the db
   this.password = await bcrypt.hash(this.password, 12)
   //this will delete the passwordConform field
   this.passwordConfirm = undefined
   next()
})


// userSchema.pre(/^find/, function (next) {
//    this.find({ active: true });
//    next()
// })

// //instance method of ES6 is availbal on all doc to call and use
userSchema.methods.correctPassword = async function (orignalPassword, userPassword) {
   return await bcrypt.compare(orignalPassword, userPassword)
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
   if (this.passwordChangedAt) {
      const changTimeStamps = parseInt(
         this.passwordChangedAt.getTime() / 1000, 10)
      // console.log(changTimeStamps, JWTTimestamp)
      //check if the password is change or not 
      return JWTTimestamp < changTimeStamps;
   }
   return false
}

//new extent method for restpassword
userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex')
   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
   // console.log({ resetToken }, this.passwordResetToken);
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000
   return resetToken
}


const User = mongoose.model('User', userSchema)

module.exports = User