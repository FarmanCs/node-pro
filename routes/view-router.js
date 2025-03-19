const express = require('express')
const viewController = require('../controller/view-controller')
const authController = require('../controller/auth-controller')
const bookingController = require('../controller/booking-controller')
const router = express.Router()

// router.use(authController.isLoggedIn)

router.get('/',
   bookingController.createBookingCheckout,
   authController.isLoggedIn,
   viewController.getOverview)

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/me', authController.protect, viewController.getAccount)
router.get('/my-tours', authController.protect, viewController.getMyTours)


router.post('/submit-user-data', authController.protect, viewController.updateUserData)

module.exports = router