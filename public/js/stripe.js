// const { default: Stripe } = require("stripe");

// const stripe = Stripe(pk_test_51PUSVV08vG7UzVbeMdF9VYhACMMf3XWxtJjG7772yP2YuUOBmGi7JAvcmB8GyFDBEpwMeP5vVYYfesVNbptBSpS800VlO84a3o);
const bookBtn = document.getElementById("book-tour");
console.log(bookBtn);

const bookTour = async tourId => {
    const response = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
    // console.log(response.data.session.url);
    window.location.href = response.data.session.url;
}

if (bookBtn) {
    bookBtn.addEventListener("click", e => {
        // console.log("yes clicking");
        e.target.textContent= "Processing...";
        bookTour(e.target.dataset.tourId);
    });
}

