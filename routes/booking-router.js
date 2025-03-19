const express = require('express')
const bookingController = require('../controller/booking-controller')
const authcontroller = require('../controller/auth-controller')

const router = express.Router()

//middlewar to protect the routers
router.use(authcontroller.protect)

router.get('/checkout-session/:tourID',
   bookingController.getCheckoutSession
)

//middleware to restrect the routes for a particuller users

router.use(authcontroller.restrectTo('admin', 'lead-guide'))

router.route('/')
   .get(bookingController.getAllBooking)
   .post(bookingController.creatBooking)

router.route('/:id')
   .get(bookingController.getBooking)
   .patch(bookingController.updateBooking)
   .delete(bookingController.deleteBooking)

module.exports = router    