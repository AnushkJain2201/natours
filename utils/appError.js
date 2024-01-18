// We want all of our AppError object to inherit from the built-in error class
class AppError extends Error {
    constructor(message, statusCode) {
        // Message is the only parameter that the buily-in error class constructor accept
        super(message);

        this.statusCode = statusCode;

        // This here we are adding another property in here based on the statusCode, if the statusCode starts with i.e 404 it is fail otherwise 500 that is error
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Doing this, so we can test this property and only send error if it is an operational error
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// From now on we will use this class to create all the errors in our application and these error will be operational errors
module.exports = AppError;