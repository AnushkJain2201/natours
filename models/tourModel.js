const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },

    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },

    maxGroupSize: {
        type: Number,
        require: [true, "A tour must have a group size"]
    },

    difficulty: {
        type: String, 
        require: [true, "A tour must have a difficulty"]
    },

    ratingsAverage: {
        type: Number,
        default: 4.5
    },

    ratingsQuantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },

    priceDiscount: Number,

    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },

    description: {
        type: String,
        trim: true
    },

    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },

    images: [String],

    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },

    startDates: [Date],

    slug: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// The get function because this property will be created each time that we get some dataout of the database. This get function is a getter
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// This is a pre document middleware, which is gonna run before an actual event.
// In this case, the event is save , it will run before .save() and .create() but not on insertMany
tourSchema.pre('save', function(next) {

    // In the save event the this is pointed to the currently processed document
    // console.log(this);
    this.slug = slugify(this.name, {lower:true});

    next();
});

// The post document middleware
// tourSchema.post('save', function(doc, next) {

//     // Don't have the this keyword here as we have the saved document as doc there.
//     console.log(doc);

//     next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

