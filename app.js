const express = require('express');
const path = require('path');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require("./utils/appError");
const globalError = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global middlewares
// set Security HTTP Headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// It will allow 100 requests from same IP in one hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});

// This middleware will intercept all the request starting with /api and create two headers in the request
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// The whitelist contains array of properties for which we allow duplicate fields
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Serving static files

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// app.use((req, res, next) => {
//     console.log("Hello from the middleware");

//     next();
// })

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();

    next();
});

// routes to get the pug pages
app.get('/', (req, res) => {
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: "Anushk"
    });
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// A middleware to handle the uncatched Route
// The app.all will run for routes for all the http methods like get post patch delete etc;
// The * in the url means all the route that is unhandled
app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: 'failed',

    //     // The originalUrl is the property of req that contains the url fron which we send the request.
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;



    // If we pass err in the next function the express will understand that it is an error and then it will skip all the middleware and lands directly into the error middleware
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// // A global error handlin middleware
// app.use((err, req, res, next) => {
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//     })
// });

// global error middleware
app.use(globalError);

module.exports = app;