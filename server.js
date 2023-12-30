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



const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});