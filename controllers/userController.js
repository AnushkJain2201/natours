const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    // This is an easy way to loop through an object
    // Object.keys will return an array with all the fields name and then we can iterate over it
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    // Send response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) create error if user POSTs the password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400));
    }

    // 2) filter the req.body

    // This filterObj method will filter the object passed and only those fields that are mentioned in the function is allowed to be present in the object
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update the object 
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This Route is not yet defined'
    })
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This Route is not yet defined'
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This Route is not yet defined'
    })
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This Route is not yet defined'
    })
}