const reviewModle = require('../models/review-model')
const factory = require('./handler-factory')

exports.setTourUserId = async (req, res, next) => {
   //these following two condition are for nested routes
   if (!req.body.tour) req.body.tour = req.params.tourId;
   if (!req.body.user) req.body.user = req.user.id;
   next()
}

exports.get_All_review = factory.getAll(reviewModle)
exports.getReview = factory.getOne(reviewModle)
exports.creat_review = factory.createOne(reviewModle)
exports.updateReview = factory.updateOne(reviewModle)
exports.deleteReview = factory.deleteOne(reviewModle)