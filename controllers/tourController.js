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

exports.getAllTours = (req, res) => {

    // res.status(200).json({

    //     status: 'success',
    //     requestedAt: req.requestTime,
    //     results: tours.length,
    //     data: {
            
    //         tours
    //     }
    // });
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

exports.getTour =  (req, res) => {
    console.log(req.params);

    // const id = Number(req.params.id)

    // const tour = tours.find(el => el.id === id);

    // res.status(200).json({

    //     // According to JSend JSON Formatting
    //     status: 'success',
    //     data: {
    //         tour
    //     }
        
    // });
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