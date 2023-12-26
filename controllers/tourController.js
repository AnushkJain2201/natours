const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// A middleware to check whether the id is valid or not
exports.checkID = (req, res, next, val) => {
    if(val > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        });
    }

    next();
}

// A middleware to check whether the body contains the name and the price parameter
exports.checkBody = (req, res, next) => {
    const {name, price} = req.body;

    if(!name || !price) {
        res.status(400).json({
            status: 'failed',
            message: 'Bad Request'
        })
    }
    
    next();
}

exports.getAllTours = (req, res) => {

    res.status(200).json({

        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            
            tours
        }
    });
};

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;

    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour);

    fs.writeFile("${__dirname}/dev-data/data/tours-simple.json", JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    });
};

exports.getTour =  (req, res) => {
    console.log(req.params);

    const id = Number(req.params.id)

    const tour = tours.find(el => el.id === id);

    res.status(200).json({

        // According to JSend JSON Formatting
        status: 'success',
        data: {
            tour
        }
        
    });
};

exports.updateTour = (req, res) => {

    const id = Number(req.params.id);

    res.status(200).json({
        status: "success",
        data: {
            tour: "<Updated Tour Here>"
        }
    })
};

exports.deleteTour = (req, res) => {

    const id = Number(req.params.id);

    res.status(204).json({
        status: "success",
        data: null
    })
}