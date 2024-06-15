const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const factory = require('./handlerFactory');

const catchAsync = require('./../utils/catchAsync');

// multerStorage is used to define how we want to store the files (its destination, name and extension)
// the cb is the callback function that works exactly like next
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-user_id-currentTimestamp.jpeg

//         // The file is same as the req.file and it contains the extension in the mimetype as images/jpeg. As we only want to use jpeg, so the following code
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     }
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if(!req.file) {
        return next();
    }

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);

    next();

}

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    // This is an easy way to loop through an object
    // Object.keys will return an array with all the fields name and then we can iterate over it
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) create error if user POSTs the password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400));
    }

    // 2) filter the req.body

    // This filterObj method will filter the object passed and only those fields that are mentioned in the function is allowed to be present in the object
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;

    // 3) Update the object 
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This Route is not yet defined! Please use signup'
    })
}

exports.getMe = (req, res, next) => {

    // here we are creating a middleware that will add the user id into the params.id so that is will be used by the getUser function in order to get the info about the current user
    req.params.id = req.user.id;
    next();
}

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// Donot update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

