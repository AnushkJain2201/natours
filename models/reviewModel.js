const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review cannot be empty!"]
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },

    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review must belong to a tour"]
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Review must belong to a user"]
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: "tour",
    //     select: "name"
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })


    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
});

// A static method to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function (tourId) {

    // In the static method this point to the current model
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRating: {$avg: '$rating'},
            }
        }
    ]);

    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
    
}

reviewSchema.post('save', function() {

    // Here we are using this.constructor instead of the Review because Review is not defined till this line of code
    this.constructor.calcAverageRatings(this.tour);

})

// Here we are creating a pre middleware to calAverageRatings in case we are updating or deleting any review
// As we have have used findByIdAndDelete and findByIdAndUpdate methods in order to delete and update review but we are using findOneAndUPdate and findOneAndDelete as we know these methods uses the same internally
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // Here this will give the current query, but we want the review doc on which it is operating on. So, heres the trick
    this.r = await this.clone().findOne();    
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour);
    
});


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;