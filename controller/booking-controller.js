const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const tourModel = require("../models/tour-model")
const bookingModel = require('../models/booking-model')
const tryCatchError = require("../utils/async-error")
// const AppError = require("../utils/error")
const factory = require('./handler-factory')

exports.getCheckoutSession = tryCatchError(async (req, res, next) => {
   // 1 get the current booked tour
   const tour = await tourModel.findById(req.params.tourID)
   // console.log(tour);

   // 2 create checkout session
   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourID,
      line_items: [
         {
            price_data: {
               currency: 'usd',
               product_data: {
                  name: `${tour.name} Tour`,
                  description: tour.summary,
                  images: [`https://127.0.0.1:7070/img/tours/${tour.imageCover}`],
                  // images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],

               },
               unit_amount: tour.price * 100,
            },
            quantity: 1,
         }
      ]

   })

   // 3 create session as a  response
   res.status(200).json({
      status: 'success',
      session
   })
})


exports.createBookingCheckout = tryCatchError(async (req, res, next) => {
   // this is tempraory , because its not secure every one booked tour with out payment
   const { tour, user, price } = req.query
   if (!tour && !user && !price) return next()
   await bookingModel.create({ tour, user, price })

   // res.redirect(`${req.protocol}://${req.get('host')}/`)
   res.redirect(req.originalUrl.split('?')[0])

})


exports.creatBooking = factory.createOne(bookingModel)
exports.getBooking = factory.getOne(bookingModel)
exports.getAllBooking = factory.getAll(bookingModel)
exports.updateBooking = factory.updateOne(bookingModel)
exports.deleteBooking = factory.deleteOne(bookingModel)