const mongoose = require('mongoose')
const tourModel = require('./tour-model')

const reviewSchema = new mongoose.Schema({
   review: {
      type: String,
      required: [true, 'review can not be empty']
   },
   rating: {
      type: Number,
      min: 1,
      max: 5
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour ']
   },
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user ']
   }
},
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
      timestamps: true
   }
);

//this will avoid the user to have duplicate or multiy views for the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

//pre hok or middleware which run befor 
reviewSchema.pre(/^find/, function (next) {
   // this.populate({
   //    path: 'tour',
   //    select: 'name summary'
   // }).populate({
   //    path: 'user',
   //    select: ['name']//simple arry and string both are working with select fileds 
   // })

   //this just don't populate tour agine when i get the tour-by-id, just to see its id
   this.populate({
      path: 'user',
      select: ['name', 'photo']//simple arry and string both are working with select fileds 
   })
   next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
   const stats = await this.aggregate([
      {
         $match: { tour: tourId }
      },
      {
         $group: {
            _id: '$tour',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' }
         }
      }
   ])
   // console.log("states data: ", stats);
   if (stats.length > 0) {
      await tourModel.findByIdAndUpdate(tourId, {
         ratingsQuantity: stats[0].nRating,
         ratingsAverage: stats[0].avgRating
      })
   }
   else {
      await tourModel.findByIdAndUpdate(tourId, {
         ratingsQuantity: 0,
         ratingsAverage: 4.5
      })
   }

}

reviewSchema.post('save', function () {
   //this  point to the current document which will going to save in reviewsmodel
   this.constructor.calcAverageRatings(this.tour)
})

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//    this.review = await this.findOne();
//    console.log(this.review);
//    next()
// })

//AI search about, and find the logic, why this one works and the above doesn't
reviewSchema.pre(/^findOneAnd/, async function (next) {
   // Get the query filter (e.g., { _id: '67b962058abba...' })
   const filter = this.getFilter();
   // Fetch the document using a separate query
   this.review = await Review.findOne(filter);
   next();
});

reviewSchema.post(/^findOneAnd/, async function () {
   await this.review.constructor.calcAverageRatings(this.review.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review