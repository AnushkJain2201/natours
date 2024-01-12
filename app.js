const express = require('express');

const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')

const app = express();

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//     console.log("Hello from the middleware");

//     next();
// })

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();

    next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// A middleware to handle the uncatched Route
// The app.all will run for routes for all the http methods like get post patch delete etc;
// The * in the url means all the route that is unhandled
app.all("*" , (req, res, next) => {
    // res.status(404).json({
    //     status: 'failed',

    //     // The originalUrl is the property of req that contains the url fron which we send the request.
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.status = 'fail';
    err.statusCode = 404;

    // If we pass err in the next function the express will understand that it is an error and then it will skip all the middleware and lands directly into the error middleware
    next(err);
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
});

module.exports = app;