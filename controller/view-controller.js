const tourModel = require('../models/tour-model')
const bookinModel = require('../models/booking-model')
const userModel = require('../models/user-model')
const tryCatchError = require('../utils/async-error')
const AppError = require("../utils/error")

exports.getOverview = tryCatchError(async (req, res, next) => {
   // 1 get tour data from the collection
   const tours = await tourModel.find()
   // 2 render the templete using tour data above
   res.status(200).render('overview', {
      title: "All Tours",
      tours
   })
})

exports.getTour = tryCatchError(async (req, res, next) => {
   // 1  get the data, for the requested tour
   const tour = await tourModel.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
   })

   if (!tour) {
      return next(new AppError(`Ther is no tour with this name: ${req.params.slug}`, 404))
   }
   // 2 build templet
   // 3 render the data 
   res.status(200).render('tour', {
      title: `${tour.name}`,
      tour
   })
})


exports.getLoginForm = tryCatchError(async (req, res) => {
   res.status(200).render('login', {
      title: 'Login to your account'
   });
});

exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: 'your account'
   });
}

exports.getMyTours = tryCatchError(async (req, res, next) => {
   // 1  Find all bookins
   const bookings = await bookinModel.find({ user: req.user.id })

   // 2 find tours with return IDs

   const tourIDs = bookings.map(el => el.tour)
   const tours = await tourModel.find({ _id: { $in: tourIDs } })

   res.status(200).render('overview', {
      title: 'My tours',
      tours
   })
})

exports.updateUserData = tryCatchError(async (req, res, next) => {
   // console.log('updateing users:', req.body);
   const updatedUser = await userModel.findByIdAndUpdate(req.user.id,
      {
         name: req.body.name,
         email: req.body.email
      },
      {
         new: true,
         runValidators: true
      }
   );
   res.status(200).render('account', {
      title: 'your account',
      user: updatedUser
   });
})