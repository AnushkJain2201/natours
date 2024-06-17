const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

const factory = require('./handlerFactory');

const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
	{name: 'imageCover', maxCount: 1},
	{name: 'images', maxCount: 3},
]);

// upload.array('images', 5);

exports.resizeTourImages = catchAsync(async(req, res, next) => {
	if(!req.files.imageCover || !req.files.images) return next();

	// 1) Cover Images
	req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
	await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${req.body.imageCover}`);

	// 2) Images
	req.body.images = [];
	await Promise.all(req.files.images.map(async(file, i) => {
		const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

		await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${filename}`);

		req.body.images.push(filename);

	}));

	// console.log(req.body);
	next();
})

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
};

exports.getAllTours = factory.getAll(Tour);

// try {
// 	// Building the query
// 	// 1) Basic Filtering

// 	// We don't mutate the original object
// 	// const queryObj = {...req.query};
// 	// const excludeFields = ['page', 'sort', 'limit', 'fields'];

// 	// // Deleting the following excluding fields from the object
// 	// excludeFields.forEach(el => delete queryObj[el]);

// 	// // 2) Advance filtering
// 	// // Converting the query object to the string
// 	// let queryString = JSON.stringify(queryObj);

// 	// // Calling the replace function to replace operator with corresponding MongoDB operator
// 	// queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

// 	// // console.log(JSON.parse(queryString));

// 	// let query = Tour.find(JSON.parse(queryString));

// 	// 3) Sorting
// 	// If req.query has a sort field than we call the sort method on the query object that we get from the Tour.find() method
// 	// if(req.query.sort) {
// 	//     const sortBy = req.query.sort.split(",").join(" ");
// 	//     query = query.sort(sortBy);
// 	// } else {
// 	//     query = query.sort("_id");
// 	// }

// 	// 4) Field limiting
// 	// if(req.query.fields) {
// 	//     const fieldsSend = req.query.fields.split(",").join(" ");
// 	//     query = query.select(fieldsSend);
// 	// } else {
// 	//     // Here we are excluding a field with the name __v as it is created by mongoose to use internally
// 	//     query = query.select('-__v');
// 	// }

// 	// 5) Pagination
// 	// const page = req.query.page * 1 || 1;
// 	// const limit = req.query.limit * 1 || 100;
// 	// const skip = (page - 1) * limit;

// 	// query = query.skip(skip).limit(limit);

// 	// if(req.query.page) {
// 	//     // This countDocuments() method return the total number of documnets in Tour model
// 	//     const numTours = await Tour.countDocuments();

// 	//     if(skip >= numTours) throw new Error("This page donot exist");
// 	// }

// 	// const query =  Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

// 	// Executing the query
// 	const features = new APIFeatures(Tour.find(), req.query)
// 		.filter()
// 		.sort()
// 		.limitFields()
// 		.paginate();

// 	const tours = await features.query;

// 	// Send response
// 	res.status(200).json({
// 		status: 'success',
// 		results: tours.length,
// 		data: {
// 			tours,
// 		},
// 	});
// } catch (err) {
// 	res.status(404).json({
// 		status: 'fail',
// 		message: err,
// 	});
// }

// Now, we are writing another parameter here that is next because we need next function to pass error that can be handled in the global error middleware
exports.createTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
// 	const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
// 		new: true,
// 		runValidators: true,
// 	});

// 	if (!updatedTour) {
// 		return next(new AppError('No tour found with that id', 404));
// 	}

// 	res.status(200).json({
// 		status: 'success',
// 		data: {
// 			tour: updatedTour,
// 		},
// 	});
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
// 	const tour = await Tour.findByIdAndDelete(req.params.id);

// 	if (!tour) {
// 		return next(new AppError('No tour found with that id', 404));
// 	}

// 	res.status(204).json({
// 		status: 'success',
// 		data: null,
// 	});
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
	// The aggregate() method will create a pipeline in which we pass an array of stages from which all the documents of Tour model will pass in a defined sequence
	// This aggegate method returns an aggregate object just like find method returns a query object
	const stats = await Tour.aggregate([
		{
			// Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage.
			$match: { ratingsAverage: { $gte: 4.5 } },
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
				maxPrice: { $max: '$price' },
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
			$sort: { avgPrice: 1 },
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
			stats,
		},
	});
});

// Suppose we have to implement a function to calculate the busiest month of the a given year by calculating how many tours start in each of the month of the year.
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1;

	const plan = await Tour.aggregate([
		{
			// What this $unwind field will do is deconstruct an array field from the input documents and then output one document for each element of the array
			// startDates is the field with the array that we want to unwind
			$unwind: '$startDates',
		},

		{
			// Here we will select only those data which is in the year that we passed in the query param
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`),
				},
			},
		},

		{
			// Here we will group the docs based on their stat month
			$group: {
				// Using a magical operator here, to find the month from the startDates, we will find it in the aggregation pipeline operators DATE EXPRESSION OPERATOR --> the $month operator
				_id: { $month: '$startDates' },
				numToursStarts: { $sum: 1 },

				// This push will create an array with all the name of the tours that start that month
				tours: { $push: '$name' },
			},
		},

		{
			$addFields: { month: '$_id' },
		},

		{
			// This stage helps in getting rid of a field
			// If we put the value 0 it will not show up but if we put up the value 1 it will show up
			$project: {
				_id: 0,
			},
		},

		{
			// Here we are sorting the tours in the descending order based on the num of tours start that year
			$sort: {
				numToursStarts: -1,
			},
		},

		{
			// It will limit us to have only 6 docs at last
			$limit: 6,
		},
	]);

	res.status(200).json({
		status: 'success',
		results: plan.length,
		data: {
			plan,
		},
	});
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;

	const [lat, lng] = latlng.split(',');
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if (!lat || !lng) {
		return next(new AppError('Please provide langitude and latitude in the format lat, lng.', 400));
	}

	//Here, we are using a special geo operator geoWithin. We want to find that tours that starts at a point that is within a radius of distance from the center latlng
	const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours
		}
	});

});

exports.getDistances = catchAsync(async (req, res, next) => {
	const {latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');
	const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

	if (!lat || !lng) {
		return next(new AppError('Please provide langitude and latitude in the format lat, lng.', 400));
	}

	const distances = await Tour.aggregate([
		// for geospatial pipeline there is only one stage that is geoNear and this one always need to be first stage in the pipeline
		// it requires any one of our geospatial field to be index
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1]
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		}, 
		{
			$project: {
				distance: 1,
				name: 1
			}
		}
	]);

	res.status(200).json({
		status: 'success',
		data: {
			data: distances
		}
	});


})
