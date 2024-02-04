const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');

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

    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },

    password: {
        type: String,
        required: [true, "Please provoide a password"],
        minLength: 8,

        // select: false means whenever we fetch password from the database, passwords are not fetched
        select: false
    },

    passwordConfirm: {
        type: String,
        required: [true, 'Please comfirm your password'],

        // Self made validator to check the confirm password is equal to the passwordConfirm
        validate: {
            // This only works only on SAVE and CREATE
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },

    passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {

    // Here this refers to the current document and isModified is a function that is available with the every document and we can call it with any field and is will return a boolean whether it is modified or not
    if (!this.isModified('password')) return next();

    // The second parameter is the cost parameter that is used to measure how CPU intensive this operation will be, the default value is 10 but it is much better to use 12
    this.password = await bcrypt.hash(this.password, 12);

    // Now we are deleting the confirmPassword field because the validator of it had already completed it's check till now
    this.passwordConfirm = undefined;

    next();
});

// Creating an instance method that will be available with all the documents of this schema
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

const User = mongoose.model('user', userSchema);

module.exports = User;