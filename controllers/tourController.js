const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

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

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
}

exports.getAllTours = async (req, res) => {

    try{
        // Building the query
        // 1) Basic Filtering

        // We don't mutate the original object
        // const queryObj = {...req.query};
        // const excludeFields = ['page', 'sort', 'limit', 'fields'];

        // // Deleting the following excluding fields from the object
        // excludeFields.forEach(el => delete queryObj[el]);

        // // 2) Advance filtering
        // // Converting the query object to the string
        // let queryString = JSON.stringify(queryObj);

        // // Calling the replace function to replace operator with corresponding MongoDB operator
        // queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // // console.log(JSON.parse(queryString));

        // let query = Tour.find(JSON.parse(queryString));

        // 3) Sorting
        // If req.query has a sort field than we call the sort method on the query object that we get from the Tour.find() method
        // if(req.query.sort) {
        //     const sortBy = req.query.sort.split(",").join(" ");
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort("_id");
        // }

        // 4) Field limiting
        // if(req.query.fields) {
        //     const fieldsSend = req.query.fields.split(",").join(" ");
        //     query = query.select(fieldsSend);
        // } else {
        //     // Here we are excluding a field with the name __v as it is created by mongoose to use internally
        //     query = query.select('-__v');
        // }

        // 5) Pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);
        
        // if(req.query.page) {
        //     // This countDocuments() method return the total number of documnets in Tour model
        //     const numTours = await Tour.countDocuments();

        //     if(skip >= numTours) throw new Error("This page donot exist");
        // }

        // const query =  Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        // Executing the query
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

        const tours = await features.query;
    
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

exports.getTourStats = async (req, res) => {
    try {
        // The aggregate() method will create a pipeline in which we pass an array of stages from which all the documents of Tour model will pass in a defined sequence
        // This aggegate method returns an aggregate object just like find method returns a query object
        const stats = await Tour.aggregate([
            {
                // Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage. 
                $match: { ratingsAverage: { $gte: 4.5 } }
            },

            {
                // Groups input documents by a specified identifier expression and applies the accumulator expression(s), if specified, to each group. Consumes all input documents and outputs one document per each distinct group. The output documents only contain the identifier field and, if specified, accumulated fields.
                // $group: {
                //     _id: null,
                //     numTours: { $sum: 1 },
                //     numRatings: { $sum: '$ratingsQuantity' },
                //     avgRating: { $avg: '$ratingsAverage' },
                //     avgPrice: { $avg: '$price' },
                //     minPrice: { $min: '$price' },
                //     maxPrice: { $max: '$price' }
                // }

                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                },

                // $group: {
                //     _id: '$ratingsAverage',
                //     numTours: { $sum: 1 },
                //     numRatings: { $sum: '$ratingsQuantity' },
                //     avgRating: { $avg: '$ratingsAverage' },
                //     avgPrice: { $avg: '$price' },
                //     minPrice: { $min: '$price' },
                //     maxPrice: { $max: '$price' }
                // }

            },

            {
                $sort: { avgPrice: 1 }
            },

            // We can also repeate stages
            // {
            //     $match: {
            //         _id: {
            //             $ne: 'EASY'
            //         }
            //     }
            // }

        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}