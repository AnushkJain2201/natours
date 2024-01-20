const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {

	// Here path attribute contains the error field that has the invalid input and value attribute has the invalid input
	const message = `Invalid ${err.path}: ${err.value}`;

	return new AppError(message, 404);

}

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	});
}

const sendErrorProd = (err, res) => {

	if(err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		console.error("Error", err);

		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		})
	}
}


// A global error handlin middleware
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = {...err};


		// The name of the err is CastError if the Database ID is invalid
		if(err.name === 'CastError') {

			// here, we are creating a function that will mark this CastError as an operation error and it also returns an error with Operational as true
			error = handleCastErrorDB(error);
		}


		sendErrorProd(error, res);
	}


};
