const fs = require('fs')
const path = require('path')
const express = require('express')
const morgan = require("morgan")
const rateLimit = require('express-rate-limit')
// const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const cookieParser = require('cookie-parser')
const xss = require('xss-clean')
const compression = require('compression')
const hpp = require('hpp')
const cors = require('cors');



const userRouter = require("./routes/user-router")
const tourRouter = require("./routes/tours-router")
const reviewRouter = require('./routes/review-router')
const viewRouter = require('./routes/view-router')
const bookingRouter = require('./routes/booking-router')
const globalError = require('./controller/error-controller')
// const userRouter =
const app = express()

//one of the most important middlewar use to allow crose port requests
app.use(cors({
   origin: 'http://127.0.0.1:8080',
   credentials: true,
   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());



app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//GLOBAL MIDDELWARE OF EXPRESS_

app.use(express.static(path.join(__dirname, 'public')))
//Set HTTP security headers
// app.use(helmet())


// for developent loggin
if (process.env.NODE_ENV === 'DEVELOPMENT') {
   app.use(morgan('dev'))
}

//limt the requst for an api
const limter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: 'To many req for this route, please try agin afte one hour'
})
app.use('/api', limter)

//express middleware for body reading of req object
// app.use(express.json({ limit: '10kb' }))//this will only handl object with 10Kb 
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())//this will parse the data frome the cookie


//data  senetization agin NOSQL injection 
app.use(mongoSanitize())

//data senetization form xss
app.use(xss())

//prevent or take care of parameter palution..
app.use(hpp({
   whitelist: [
      'duration',
      'price',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficluty'
   ]//this will worke on those fields which is in arry
}))

//a middleware for file compression
app.use(compression())

app.use((req, res, next) => {
   req.requestTime = new Date().toISOString()
   // console.log(req.cookies);
   next()
})



app.use('/', viewRouter)

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/review', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

//handling of api withou any right routes
// app.all('*', (req, res, next) => {
//    next(new AppError(`can't find ${req.originalUrl} on this server`, 404))
// })

//error handling middleware
app.use(globalError)//globalError is a imported function for global error  hangling

module.exports = app

