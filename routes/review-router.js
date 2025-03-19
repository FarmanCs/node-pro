const express = require('express')
const reviewController = require('../controller/review-controller')
const authcontroller = require('../controller/auth-controller')

const router = express.Router({ mergeParams: true })

//POST /tours/23434234234/vewiews
//get /tours/23434234234/vewiews
//POST /views

router.use(authcontroller.protect)

router.route('/')
   .get(reviewController.get_All_review)
   .post
   (
      authcontroller.restrectTo('user', 'admin'),
      reviewController.setTourUserId,
      reviewController.creat_review
   )

router.route("/:id")
   .get(reviewController.getReview)
   .delete(authcontroller.restrectTo('user', 'admin'), reviewController.deleteReview)
   .patch(authcontroller.restrectTo('user', 'admin'), reviewController.updateReview)

module.exports = router    