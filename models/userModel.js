const mongoose = require("mongoose");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"],
    },

    email: {
        type: String,
        required: [true, "Please tell us your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },

    photo: String,

    password: {
        type: String,
        required: [true, "Please provoide a password"],
        minLength: 8
    },

    passwordConfirm: {
        type: String,
        required: [true, 'Please comfirm your password']
    }
});

const User = mongoose.model('user', userSchema);

module.exports = User;