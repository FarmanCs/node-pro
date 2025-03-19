const express = require("express")
const tourController = require("../controller/tour-controller")
const userAuth = require('../controller/auth-controller')
const reviewRouter = require('../routes/review-router')
const tourRouter = express.Router()


//nested router with reviews 
tourRouter.use('/:tourId/review', reviewRouter)

//all tour Routers...
tourRouter.route('/')
   .get(tourController.getAllTours)
   .post(tourController.addTours)


tourRouter.route('/top-cheap')
   .get(tourController.getAllTours)

tourRouter.route('/tour-state').get(tourController.getTourStates)
tourRouter.route('/tour-plane/:year').get(
   userAuth.protect,
   userAuth.restrectTo('admin', 'lead-guide', 'guide'),
   tourController.get_tour_plan)

tourRouter.route('/:id')
   .get(tourController.get_Tour)
   .patch(
      userAuth.protect,
      userAuth.restrectTo('admin', 'lead-guide'),
      tourController.uploadTourImages,
      tourController.resizeTourImages,
      tourController.updateTour)
   .delete(
      userAuth.protect,
      userAuth.restrectTo('admin', 'lead-guide'),
      tourController.deleteTour)

//two to do get this thing
//tour-distance?distance=23437&center=-4343,2434&unit=54k
//tour-distance/3234/center/-45,54/unit/mi
tourRouter.route('/tour-within/:distance/center/:latlng/unit/:unit')
   .get(tourController.getToursWithin)

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)


module.exports = tourRouter