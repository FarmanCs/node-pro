const mongoose = require("mongoose")
const slug = require('slugify')
const validate = require('validator')

const tourSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "name is missing here"],
      unique: true,
      trim: true,
      maxLength: [50, "name should not be that much longer..."],
      // validate: [validate.isAlpha, 'tour name only have charactors....']
   },
   slug: String,
   duration: {
      type: String,
      required: [true, "tour must have duration, for how long will this tour be"],
      maxLength: [7, "Duration should not be that much longer..."]

   },
   maxGroupSize: {
      type: String,
      required: [true, "tour must have grouph of people"],
      maxLength: [20, "grouph should not be that much longer..."]

   },
   difficulty: {
      type: String,
      required: [true, "Tour may have some difficulty"],
      maxLength: [50, "Don't mention that much problem"],
      enum: {
         values: ['easy', 'medium', 'difficult'],
         message: 'Difficulty either be easy or medium or difficlut'
      }
   },
   price: {
      type: Number,
      required: [true, "price must be included"]
   },
   priceDiscount: {
      type: Number,
      validate: {
         validator: function (val) {
            //this only  works with creat new doc, it will not work on update
            return val < this.price
         },
         message: 'Discount should not be grater or equal to the price itself'
      }
   },
   ratingsAverage: {
      type: Number,
      min: [1, 'Rating can not be less than 1'],
      max: [5, 'Rating can not be grater than 5'],
      set: val => Math.round(val * 10) / 10
   },
   ratingsQuantity: {
      type: Number,
      default: 0
   },
   summary: {
      type: String,
      trim: true,
      required: true,
      maxLength: [100, "summary should not be that much longer..."],
      minLength: [10, "summary should not be that much longer..."]
   },
   description: {
      type: String,
      trim: true,
      maxLength: [5000, 'description should not be more longer']
   },
   imageCover: {
      type: String,
      required: [true, "Tour must have cover image"]
   },
   images: [String],
   startDates: [Date],
   secretTour: {
      type: Boolean,
      default: false
   },
   startLocation: {
      type: {
         type: String,
         default: 'Point',
         enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
   },
   locations: [
      {
         type: {
            type: String,
            default: "Point",
            enum: ["Point"]
         },
         coordinates: [String],
         address: String,
         description: String,
         day: Number
      }
   ],
   /* guides: Array,//this works on embeding user data into tourModle
   //this will when we import the userModle to this tour model other wise not
   //only works when you run pre('save') middleware down there with this.guides etc*/
   guides: [//this thing no need for the imporet of userModle just ref it down
      {
         type: mongoose.Schema.ObjectId,
         ref: 'User'//reference to the userModel, no need to require the userModel
      }
   ]
},
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
      timestamps: true
   }
)

//make an index on price
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7
})

tourSchema.virtual('reviews', {
   ref: 'Review',
   foreignField: 'tour',
   localField: '_id'
})
// save doc and responsible for embeding user into tourmodel for ER
// tourSchema.pre('save', async function (next) {
//    const tourguide = this.guides.map(async id => await userModel.findById(id))
//    this.guides = await Promise.all(tourguide)
//    next()
// })

//document middleware  run before save() and .create()
tourSchema.pre('save', function (next) {
   this.slug = slug(this.name, { lower: true })
   next()
})



tourSchema.pre(/^find/, function (next) {
   this.populate({ path: "guides", select: '-__v' })
   next()
})


// query middleware....
tourSchema.pre(/^find/, function (next) {
   this.find({ secretTour: false })
   this.start = Date.now()
   next()
})

tourSchema.post(/^find/, function (doc, next) {
   console.log(`query took ${Date.now() - this.start} second`);
   next()
})


// AGREGATION MIDDELWARE
// tourSchema.pre('aggregate', function (next) {
//    // console.log(this.pipeline());
//    // this.pipeline().unshift({ $match: { secretTour: true } })
//    console.log(this.pipeline());
//    next()
// })



//make a model for tourSchema 
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour