const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

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
            status: "success",
            data: {
                tour: newTour
            }
        })
    });
};

exports.getTour =  (req, res) => {
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

exports.updateTour = (req, res) => {

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

exports.deleteTour = (req, res) => {

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