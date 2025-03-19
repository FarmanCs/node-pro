const tourModle = require("../models/tour-model")
// const APIFeaturs = require("../utils/api-features")
const tryCatchError = require("../utils/async-error")
const AppError = require("../utils/error")
const factory = require('./handler-factory')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      cb(null, true)
   } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false)
   }
}
const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})

//for more than one images upload and can upload to different fields
exports.uploadTourImages = upload.fields([
   { name: 'imageCover', maxCount: 1 },
   { name: 'images', maxCount: 3 }
])
// upload.single('name')//for single image
// upload.array('name', 5)//for same but more than one image
//middleware to handle the req.files for uploading imags
exports.resizeTourImages = tryCatchError(async (req, res, next) => {
   // console.log(req.files);
   if (!req.files.imageCover || !req.files.images) return next()
   // 1) coverImage process
   // const imageCoverFilename = `tour- ${req.params.id}-${Date.now()}-cover-jpeg`
   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
   await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`)
   // req.body.imageCover = imageCoverFilename//this works with imageCoverFilesname...

   // 2) images procesing  to db and storage
   req.body.images = []
   await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
      await sharp(file.buffer)
         .resize(2000, 1333)
         .toFormat('jpeg')
         .jpeg({ quality: 90 })
         .toFile(`public/img/tours/${filename}`)
      req.body.images.push(filename)
   })
   )

   next()
})

exports.top_Cheap = (req, res, next) => {
   req.query.limit = '5'
   req.query.sort = '-ratingAverage,price'
   req.query.fields = 'name,ratingAvverage,price,difficulty,summary'

   next()
}

exports.getAllTours = factory.getAll(tourModle)

exports.get_Tour = factory.getOne(tourModle, { path: 'reviews' })
exports.addTours = factory.createOne(tourModle)
exports.updateTour = factory.updateOne(tourModle)
exports.deleteTour = factory.deleteOne(tourModle)

exports.getTourStates = tryCatchError(async (req, res) => {
   const state = await tourModle.aggregate([
      {
         $match: { ratingAverage: { $gte: 4.5 } }
      },
      {
         $group: {
            _id: { $toUpper: '$difficulty' },//get grouph name in uppercase
            // _id: '$difficulty',
            // _id: '$ratingAverage',
            // _id: '$price',
            numTour: { $sum: 1 },
            numRating: { $sum: '$ratingQuantaty' },
            avgRating: { $avg: '$ratingAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
         }
      },
      {
         $sort: { avgPrice: 1 }
      },
      {
         $match: { _id: { $ne: 'EASY' } }
      }
   ])
   res.status(201).json({
      status: 'succes...',
      Data: state
   })
})

exports.get_tour_plan = tryCatchError(async (req, res) => {
   const year = req.params.year * 1
   const plan = await tourModle.aggregate([
      {
         $unwind:
            '$startDates'
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`)
            }
         }
      },
      {
         $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' }
         }
      },
      {
         $addFields: {
            month: '$_id'
         }
      },
      {
         $project: {
            _id: 0
         }
      },
      {
         $sort: {
            numTourStarts: -1
         }
      },
      {
         $limit: 10//this thing is got to use becasue this will limit the output result to the number you pass to it here is 10, so you will see 10 result in the output
      }
   ])

   res.status(200).json({
      status: 'succes...',
      total: plan.length,
      Data: plan
   })
})


// /tour-within/:distance/center/:latlng/unit/:unit
// /tour-within/3234/center/34.091524,-118.216398/unit/mi
exports.getToursWithin = tryCatchError(async (req, res, next) => {
   const { distance, latlng, unit } = req.params
   const [lat, lng] = latlng.split(',');

   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

   if (!lat || !lng) {
      next(new AppError("please provide latitude and langitude ", 404))
   }
   // console.log(distance, latlng, unit);

   const Tour = await tourModle.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
   })


   res.status(200).json({
      status: 'success',
      length: Tour.length,
      data: Tour
   })
})


exports.getDistances = tryCatchError(async (req, res, next) => {
   const { latlng, unit } = req.params
   const [lat, lng] = latlng.split(',');

   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

   if (!lat || !lng) {
      next(new AppError("please provide latitude and langitude ", 404))
   }

   const distances = await tourModle.aggregate([
      {
         $geoNear: {
            near: {
               type: 'Point',
               coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
         }
      },
      {
         $project: {
            distance: 1,
            name: 1
         }
      }
   ])

   res.status(200).json({
      status: 'success',
      // length: Tour.length,
      data: distances
   })
})