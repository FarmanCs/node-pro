const tryCatchError = require('../utils/async-error')
const APIFeaturs = require("../utils/api-features")
const AppError = require("../utils/error")

exports.deleteOne = Model => tryCatchError(async (req, res, next) => {
   const doc = await Model.findByIdAndDelete(req.params.id)
   // const doc = await Model.findByIdAndUpdate({ _id: req.params.id })

   if (!doc) {
      next(new AppError("No Doc found with this ID: ", 404))
   }
   res.status(204).json({
      status: 'salected doc Deleted  succesfully...',
      // delete_Tour: delete_Tour
   })
})

exports.updateOne = Model => tryCatchError(async (req, res) => {
   const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
   res.status(201).json({
      status: 'update doc data succesfully...',
      Data: doc
   })
})

exports.createOne = Model => tryCatchError(async (req, res) => {
   // const doc = await Model.create(req.body)
   let doc = new Model(req.body)
   doc = await doc.save()
   res.status(201).json({
      status: 'Doc created successfully...',
      length: doc.length,
      data: doc
   })
})

exports.getOne = (Model, populatOptions) => tryCatchError(async (req, res, next) => {
   let query = Model.findOne({ _id: req.params.id })
   if (populatOptions) query = query.populate(populatOptions)
   const doc = await query

   if (!doc) {
      return next(new AppError('No document found with this id: ', 404))
   }
   res.status(200).json({
      status: 'get document Data succesfully...',
      data: doc
   })
})

exports.getAll = Model => tryCatchError(async (req, res) => {
   //a litle hack for jsut to get all reviw as well by same handler
   let filter = {};
   if (req.params.tourId) filter = { tour: req.params.tourId }

   // EXECUTE THE QUERY  INTO THE DATABASE
   const features = new APIFeaturs(Model.find(filter), req.query)
      .filter()
      .sort()
      .limiting()
      .pagination()

   // const doc = await features.query.explain()
   //this will execute the find query in data base & return the expected result
   //sending result or response the borawser

   const doc = await features.query

   res.status(200).json({
      status: "Here is the doc list:",
      result: doc.length,
      Data: doc
   })

})