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

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Wanderer'
    });
}