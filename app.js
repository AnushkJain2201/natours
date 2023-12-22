const express = require('express');
const fs = require('fs');

// Here, the express is a function that we get from the express module which upon on calling will add a bunch of methods to our app variable here.
const app = express();

// Here, the express.json() is a middleware. A middleware is just a function that can modify the incoming request data.
// It is middleware because it stands between the requesrt and the response. It's just a step that request goes through while it's being processed. 
// And in this example, the middleware is simply adding the data to the req object
// In other words we must have this express.json() middleware if we want to have the body in req object
app.use(express.json());

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

// To get all the tours
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

// To add a new tour
// If the request contains any data it is with the req object,
// But out of the box, Express donot put that body data in the req, so in order to have that data available, we have to use something called middleware.
// Now, to make this work, we will add a simple middleware at the top
app.post('/api/v1/tours', (req, res) => {
    // console.log(req.body);

    // Here, we are creating id of the new object by adding 1 in the id of the previous object
    const newId = tours[tours.length - 1].id + 1;

    // The assign method of Object helps in merging two objects
    const newTour = Object.assign({id: newId}, req.body);

    // Adding the newTour in the array
    tours.push(newTour);

    // Now, we are gonna write the array with the new object in our file
    fs.writeFile("${__dirname}/dev-data/data/tours-simple.json", JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    })

    // We always has to send somthing, in order to finish the so called request/response cycle
})

// To get a particular tour
// Here, in the url we will also have a variable id which defines which tour we have to send
// It is defined by the :<variable-name>
// req.params is the place where all the parameters that we define in the url is stored

// To mark any parmeter optional, we mark the ? after it
// For example here y is optional
// app.get('api/v1/tours/:id/:x/:y?')
app.get('/api/v1/tours/:id', (req, res) => {
    console.log(req.params);
    
    // This find method of an array help us to find an element based on the condition in the callback function, it will also return an array
    const id = Number(req.params.id)

    if(id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        })
    }

    const tour = tours.find(el => el.id === id);

    res.status(200).json({

        // According to JSend JSON Formatting
        status: 'success',
        data: {
            tour
        }
        
    });
})

// The first method that we will use is basically listen method to start up the server.
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});