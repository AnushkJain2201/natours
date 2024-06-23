const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
    // Get the tour data from the collection
    const tours = await Tour.find();

    // build The template

    // render the template using the data from 1
    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('overview', {
        title: 'All Tours',
        tours
    });
})

exports.getTour = catchAsync(async (req, res, next) => {
    // Get the data for the requested tour including reviews nad tours guides
    const { slug } = req.params;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        fields: 'review, rating, user'
    });

    if(!tour) {
        return next(new AppError('No tour found with that id', 404));
    }
    // build the template

    // render the template using the data from 1
    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('tour', {
        title: tour.name,
        tour
    });
})

exports.getLoginForm = (req, res) => {
    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('login', {
        title: 'Login'
    });
}

exports.getAccount = (req, res) => {
    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('account', {
        title: 'Your Account'
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log("Updating user" + req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });

    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('account', {
        title: 'Your Account',
        user: updatedUser
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({user: req.user.id});

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);

    const tours = await Tour.find({_id: {$in: tourIDs}});

    // 3) Retrun the tours
    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('overview', {
        title: 'My Tours',
        tours
    });
});