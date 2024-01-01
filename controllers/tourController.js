const Tour = require('./../models/tourModel')

// A middleware to check whether the body contains the name and the price parameter
// exports.checkBody = (req, res, next) => {
//     const {name, price} = req.body;

//     if(!name || !price) {
//         res.status(400).json({
//             status: 'failed',
//             message: 'Bad Request'
//         })
//     }
    
//     next();
// }

exports.getAllTours = async (req, res) => {

    try{
        const tours = await Tour.find();
    
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.createTour = async (req, res) => {

    try{
        const newTour = await Tour.create(req.body);
        
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: "Invalid Data sent!"
        })
    }
};

exports.getTour = async (req, res) => {

    try{   
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

    
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