const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);

    // 2) Create the checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // This success url is not secure at all to create a new booking as whoever knows this url can easily access this information and redirect to the new booking wihtout having to pay. To make it secure we will use the Stripe webhooks later
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1,
            }
        ],
    });

    // 3) Send session to client
    res.status(200).json({
        status: 'success',
        session
    });

    // res.redirect(303, session.url);
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     // This is only temporary because its unsecure
//     const {tour, user, price} = req.query;

//     if(!tour && !user && !price) {
//         return next();
//     }

//     await Booking.create({tour, user, price})

//     res.redirect(req.originalUrl.split("?")[0]);
// });

const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({email: session.customer_email}))._id;
    const price = session.amount_total/100;
    await Booking.create({tour, user, price});
}

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    } catch (e) {
        return res.status(400).send(`Webhook error ${err.message}`);
    }

    if(event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);

        res.status(200).json({received: true});
    }



}

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);