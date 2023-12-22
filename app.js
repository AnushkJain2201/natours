const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getAllTours = (req, res) => {
    res.status(200).json({

        status: 'success',
        results: tours.length,
        data: {
            
            tours
        }
    });
};

const createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;

    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour);

    fs.writeFile("${__dirname}/dev-data/data/tours-simple.json", JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    });
};

const getTour =  (req, res) => {
    console.log(req.params);

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
};

const updateTour = (req, res) => {

    const id = Number(req.params.id)

    if(id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: "success",
        data: {
            tour: "<Updated Tour Here>"
        }
    })
};

const deleteTour = (req, res) => {

    const id = Number(req.params.id)

    if(id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        })
    }

    res.status(204).json({
        status: "success",
        data: null
    })
}

// app.get('/api/v1/tours', getAllTours);

// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);   
// app.delete('/api/v1/tours/:id', deleteTour);

// Instead of writing code for each http method we can write like this if the same url have different http methods
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});