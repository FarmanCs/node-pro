const mongoose = require("mongoose")
require('dotenv').config()//simple and easy way to require env file
// const dotenv = require('dotenv')//if we do require the env via this way then  we must use the line 3 code for it config it and give a path for env file
// dotenv.config({ path: './.env' })

//error handle for uncaughtException
// process.on('uncaughtException', err => {
//    console.log("UNCAUGHT EXCEPTION : Shuting down...");
//    console.log(err.name, err.message);
//    process.exit(1)
// })
const app = require('./app')
const DB = process.env.MONGO_URL.replace('<PASSWORD>', process.env.PASSWORD)

mongoose.connect(DB)
   .then(() => {
      app.listen(process.env.PORT, () => {
         console.log('Server starting listeing to at prot ', process.env.PORT);
      })
   })
   .then(() => {
      console.log("Data Base connected");
   })


//this cathc the error insted of catching it above with then and catch
process.on('unhandledRejection', err => {
   console.log(err.name, err.message)
   console.log("UNHANDLE REJECTION Shuting down...");
   // Server.close(() => {//this line code only work if the code at line 25 is run
   //    process.exit(1)
   // })
   process.exit(1)
})
