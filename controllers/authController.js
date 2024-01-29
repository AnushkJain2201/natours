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
        passwordConfirm: req.body.passwordConfirm
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
