const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');

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

    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    // As soon as the user signed in it is automatically logged in

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});
