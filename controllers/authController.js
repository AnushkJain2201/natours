// util is an inbuilt module in express and it has a function promisify that Takes a function following the common error-first callback style, i.e. taking a (err, value) => ... callback as the last argument, and returns a version that returns promises.
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {

    // This line of code has a security flaw as the client can manipulate the req.body to add any attribute, in this way he or she can declare themself as admin and that we don't want here
    // const newUser = await User.create(req.body);

    // Now this code will discard that security flaw
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    // As soon as the user signed in it is automatically logged in

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;

    // Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // Check if user exist in the database and && passport is correct
    // Here, findOne will find the record based on the email and select function will also fetch the password field as we disabled the fetching of password field in the userModels
    const user = await User.findOne({ email }).select("+password");

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password!", 401));
    }

    // If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        ststus: 'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {

    // The standard for sending token back with the request is that we always use the name of the header as authorization and the value of that header will be Bearer <JWT Token>
    // We can get the headers in the Express as req.headers

    // 1) Get the token and check if its exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If token is undefined we will return an error
    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access', 401));
    }

    // 2) Verification token
    // The last parenthesis contains the parameters of the verify function
    // decoded contains the object with the id that we used during the creation of the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
    // If the payload is tampered, it will throw JsonWebTokenError, that we will handle in the global error handler in errorController.js
    // Another error occurred if user tries to access route with the expired token, it wil throw TokenExpiredError, handled in global error handler


    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token donot exist!', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed Password! Please log in again', 401));
    }

    // Grant access to the protected route
    req.user = currentUser;
    next();
});

// Here we are need to pass arguments in the middleware function and thats something we dont do with middleware function, so here we have to create a wrapper function that will return a middleware function instead
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array in this case ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on posted email 
    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new AppError("There is no user with that email address", 404));
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({validateBeforeSave: false});


    // 3) send it to user's email
});

exports.resetPassword = (req, res, next) => {

}
