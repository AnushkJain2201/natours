const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
    // Get the tour data from the collection
    const tours = await Tour.find();

    // build The template

    // render the template using the data from 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
})

exports.getTour = catchAsync(async (req, res) => {
    // Get the data for the requested tour including reviews nad tours guides
    const { slug } = req.params;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        fields: 'review, rating, user'
    });
    // build the template

    // render the template using the data from 1
    res.status(200).set('Content-Security-Policy', "frame-src 'self'").render('tour', {
        title: tour.name,
        tour
    });
})