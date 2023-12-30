const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path: './config.env'});

// To change the template passwrod with the original password
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// Used for older version
// mongoose.connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
// }).then(() => {
//     console.log("DB Connection is successful!!");
// })

mongoose.connect(DB).then(() => {
    console.log("DB Connection is successful!!");
})

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
    name: 'The Forest Hiker',
    rating: 4.7,
    price: 497
});

const testTour2 = new Tour({
    name: 'The Park Camper',
    rating: 4.7,
    price: 497
});

// method to save the document in the mongodb
testTour.save().then((doc) => {
    console.log(doc);
}).catch((err) => console.log(err));

testTour2.save().then((doc) => {
    console.log(doc);
}).catch((err) => console.log(err));

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});