// util is an inbuilt module in express and it has a function promisify that Takes a function following the common error-first callback style, i.e. taking a (err, value) => ... callback as the last argument, and returns a version that returns promises.
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const crypto = require('crypto');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    console.log(token);

    // Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        },
        
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

    // const token = signToken(newUser._id);

    // // As soon as the user signed in it is automatically logged in

    // res.status(201).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
});

exports.protect = catchAsync(async (req, res, next) => {

    // The standard for sending token back with the request is that we always use the name of the header as authorization and the value of that header will be Bearer <JWT Token>
    // We can get the headers in the Express as req.headers

    // 1) Get the token and check if its exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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

    // For rendering pages correctly
    res.locals.user = currentUser;

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

    if (!user) {
        return next(new AppError("There is no user with that email address", 404));
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });


    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with new password and passwordConfirm to: ${resetURL}.\nif didn't forget your password please ignore this message`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email, try again later!', 500));
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // The second parameter is to check if the token has expires or not
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // In this case, we don't turn off the validators because we want to validate the password and passwordConfirm
    await user.save();

    // 3) Update changePasswordAt property for the user
    // This is done in a pre middleware in the userModel.js

    // 4) Log the user in (SEND JWT)
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) get user from the collection

    // we will first call the protect middleware as it is a protected route and that middleware add the user in the req obj
    const user = await User.findById(req.user.id).select('+password');

    // 2) check if the posted password is correct

    // Here we are calling an instance method of userModel to compare between passwords
    if (!(user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
    }

    // 3) if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    // User.findByIdAndUpdate will not work as it will not run the validators and the pre save middleware, that we dont want
    await user.save();

    // 4) log user in, send JWT
    createSendToken(user, 200, res);


});

// only for rendering pages for the users logged in or without logged in
exports.isLoggedIn = async (req, res, next) => {

    let token;
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;

            // verifies the token 
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

            // 3) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 4) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is a logged in user
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
}

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success',
        message: 'Logged out!'
    });
}
