const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const User = require("./userModel");

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, "A tour name must have less or equal than 40 characters"],
        minLength: [10, "A tour name must have more or equal than 10 characters"]
        // Eliminating this validator because it is also not permitting spaces
        // validate: [validator.isAlpha, "Name must only contain characters"]
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
        require: [true, "A tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy, medium, difficult'
        }
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, "Rating must be below 5.0"]
    },

    ratingsQuantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },

    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {

                // this here will point to the current document when we are creating a new document so this function here is not going to work on update
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price'

        }
    },

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

    slug: String,

    secretTour: {
        type: Boolean,
        default: false
    },

    // Here in the startLocation it is the nested object not the options object like the others, for storing the geospatial data we need to create an another object
    startLocation: {
        // GeoJSON in order to specify geospatial data
        type: {
            type: String,

            // The default value is of point, which can also be lines, or polygons etc
            default: 'Point',
            enum: [
                'Point'
            ]
        },

        // Here we also needed array of numbers in the coordinates
        coordinates: [Number],
        address: String,
        description: String
    },

    // Now here we want multiple locations to be embedded, so we create an array, then created an objec to store multiple data
    // To specify an array, it will basically create multiple documents inside of the parent document
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: [
                    'Point'
                ]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],

    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// The get function because this property will be created each time that we get some dataout of the database. This get function is a getter
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',

    // foreignField is the field in the child where reference to the parent model is stored
    foreignField: 'tour',

    // localField is the field in the parent model which is stored in the child model
    localField: '_id'
});

// This is a pre document middleware, which is gonna run before an actual event.
// In this case, the event is save , it will run before .save() and .create() but not on insertMany
tourSchema.pre('save', function (next) {

    // In the save event the this is pointed to the currently processed document
    // console.log(this);
    this.slug = slugify(this.name, { lower: true });

    next();
});

// tourSchema.pre('save', async function(next) {

//     // this.guides here will be the array of all the user ids that are giudes
//     // guidesPromises will contain all the promises that is caused by findById
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);

//     next();
// })

// The post document middleware
// tourSchema.post('save', function(doc, next) {

//     // Don't have the this keyword here as we have the saved document as doc there.
//     console.log(doc);

//     next();
// })

// Pre find middleware function that will run for both find and findOne query
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        // here we can select the fields that we want to populate if we don't want that we will just write 'guides' in the populate function, and that will get all the fields
        path: 'guides',

        // here, we are deselecting the __v and passwordChangedAt field
        select: '-__v -passwordChangedAt'
    });

    next();
});

// // Pre find query middleware
// tourSchema.pre('find', function(next) {
//     this.find({secretTour: { $ne: true }})

//     next();
// });

// // Pre findOne query middleware
// tourSchema.pre('findOne', function(next) {
//     this.find({secretTour: { $ne: true }})

//     next();
// })

// Post find query middleware
tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
    // Here this points towards current aggregation object and this.pipeline will return the array of all the pipeline stages
    console.log(this.pipeline());

    // here we are adding another stage in the array that will filter out the object whose secretKey is not true
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
})



const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

