const express = require('express');
const fs = require('fs');

// Here, the express is a function that we get from the express module which upon on calling will add a bunch of methods to our app variable here.
const app = express();

// Defining routes
// The way is simple app.<http-method>(<url>, <callback-function-to-define-what-to-do-now>)
// app.get('/', (req, res) => {

//     // Here, the status method will set the response status and the send method will send the string response to the client
//     // res.status(200).send('Hello from the server side');

//     // Here, we are using the json method to send the json response to the client
//     // By using the json method, it will automatically set our content type to application/json
//     res.status(200).json({
//         message: "Hello from the server side!!",
//         app: 'Natours'
//     });
// });

// Here, we are just creating the post request for the same url
// app.post('/', (req, res) => {
//     res.status(200).send('You can post to this endpoint')
// })

// Here, we are reading the data from a file and parsing it to JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({

        // According to JSend JSON Formatting
        status: 'success',
        results: tours.length,
        data: {
            
            // tours: tours -- As both the name of the key and value are same, we can just write 
            tours
        }
    });
});

// The first method that we will use is basically listen method to start up the server.
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});