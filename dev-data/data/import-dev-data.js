const fs = require('fs')
const mongoose = require("mongoose")
require('dotenv').config()
const app = require('./../../app')


const tourModel = require('./../../models/tour-model')
const userModel = require('./../../models/user-model')
const reviewModel = require('./../../models/review-model')


const DB = process.env.MONGO_URL.replace('<PASSWORD>', process.env.PASSWORD)

mongoose.connect(DB)
   .then(con => {
      console.log("Data Base connected");
   })
   .then(() => {
      app.listen(process.env.PORT, () => {
         console.log('Server starting listeing to at prot ', process.env.PORT);
      })
   })
   .catch((err) => {
      console.log("Error", err);
   })


//reading the json file
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

//importing file
const importData = async () => {
   try {
      console.log("Importing tours...");
      await tourModel.create(tour);
      await userModel.create(user, { validateBeforeSave: false });
      await reviewModel.create(reviews);

      console.log("Data successfully loaded to the database");
   } catch (error) {
      console.error("Error importing data:", error);
   }
   process.exit();
};


//delelte all data from database
const deleteDataTour = async () => {
   try {
      await tourModel.deleteMany()
      await userModel.deleteMany()
      await reviewModel.deleteMany()
      console.log("data sucessfully deleted...");
   } catch (error) {
      console.log(error.message);
   }
   process.exit()
}

//something new to call the function form command or terminal using process.argv
// console.log(process.argv);
if (process.argv[2] === '--import') {
   importData()
}
else if (process.argv[2] === '--delete') {
   deleteDataTour()
}