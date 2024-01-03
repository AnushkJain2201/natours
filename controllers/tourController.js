const Tour = require('./../models/tourModel')

// A middleware to check whether the body contains the name and the price parameter
// exports.checkBody = (req, res, next) => {
//     const {name, price} = req.body;

//     if(!name || !price) {
//         res.status(400).json({
//             status: 'failed',
//             message: 'Bad Request'
//         })
//     }
    
//     next();
// }

exports.getAllTours = async (req, res) => {

    try{
        console.log(req.query);
        // Building the query
        // 1) Basic Filtering

        // We don't mutate the original object
        const queryObj = {...req.query};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];

        // Deleting the following excluding fields from the object
        excludeFields.forEach(el => delete queryObj[el]);

        // 2) Advance filtering
        // Converting the query object to the string
        let queryString = JSON.stringify(queryObj);

        // Calling the replace function to replace operator with corresponding MongoDB operator
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // console.log(JSON.parse(queryString));

        let query = Tour.find(JSON.parse(queryString));

        // 3) Sorting
        // If req.query has a sort field than we call the sort method on the query object that we get from the Tour.find() method
        if(req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // const query =  Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        // Executing the query
        const tours = await query;
    
        // Send response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.createTour = async (req, res) => {

    try{
        const newTour = await Tour.create(req.body);
        
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: "Invalid Data sent!"
        })
    }
};

exports.getTour = async (req, res) => {

    try{   
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

    
};

exports.updateTour = async (req, res) => {

    try {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }); 

        res.status(200).json({
            status: "success",
            data: {
                tour: updatedTour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.deleteTour = async (req, res) => {

    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};