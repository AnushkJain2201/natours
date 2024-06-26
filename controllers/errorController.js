const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
	// Here path attribute contains the error field that has the invalid input and value attribute has the invalid input
	const message = `Invalid ${err.path}: ${err.value}`;

	return new AppError(message, 404);
};

const handleJWTError = () => {
	return new AppError('Invalid Token, Please log in again', 401);
}

const handleJWTExpiredError = () => {
	return new AppError('The Token Expired, Please login again', 401);
}

const handleDuplicateFieldsDB = (err) => {
	// HEre we will use the regex to extract the duplicate value from the errmsg attribute of err
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	// const message = `Duplicate field value: ${err.keyValue[keys[0]]} . Please use another value!`;
	const message = `Duplicate field value: ${value}. Please use another value!`;

	return new AppError(message, 400);
};

const handleVaidationErrorDB = (err) => {
	// The Object.value will create an object of all the error message that we get on interating over err.errors
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;

	return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {

	// if the url starts with api that means its an API error then we simply return json error
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	}
	// else its an frontend error so we have to show an error message
	console.log("Error ----------", err);
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong',
		message: err.message,
	})
};

const sendErrorProd = (err, req, res) => {

	// if the url starts with api that means its an API error then we simply return json error
	if (req.originalUrl.startsWith('/api')) {
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
		console.error('Error', err);

		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}
	// else its an frontend error so we have to show an error message

	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong',
			message: err.message,
		})
	}
	console.error('Error', err);

	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong',
		message: 'Please try again later',
	})

};

// A global error handlin middleware
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		//This is somehow not working
		let error = { ...err };
		error.message = err.message;

		// The name of the err is CastError if the Database ID is invalid
		if (err.name === 'CastError') {
			// here, we are creating a function that will mark this CastError as an operation error and it also returns an error with Operational as true
			error = handleCastErrorDB(err);
		}

		// Handler for the duplicate fields
		// console.log(err.code === 11000);
		if (err.code === 11000) {
			error = handleDuplicateFieldsDB(err);
		}

		// Handler for validation error
		if (err.name === 'ValidationError') {
			error = handleVaidationErrorDB(err);
		}

		// Handler for tampering of Json web token
		if (err.name === 'JsonWebTokenError') {
			error = handleJWTError();
		}

		if (err.name === 'TokenExpiredError') {
			error = handleJWTExpiredError();
		}

		sendErrorProd(error, req, res);
	}
};
