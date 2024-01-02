const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');


dotenv.config({path: './config.env'});

// To change the template passwrod with the original password
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => {
    console.log("DB Connection is successful!!");
});

// Read JSON File

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data into database
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data successfully loaded");
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

// Delete all data from database
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data deleted successfully");
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

if(process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);