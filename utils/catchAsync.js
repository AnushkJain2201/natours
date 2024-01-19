module.exports = (fn) => {

	// Here we are returning a new anonymous function because that returned function contains the value of the function that we want to call and that will store in the handler that we are exporting and we are able to pass req, res, next in it because this function is now handled by the Express when we hit any route
	return (req, res, next) => {

		// Here, the fn function is an asynchronus function and async functions returns promises, that means we can catch it
		// In the catch function we can only pass the next function and it will be called with the parameter that catch receives i.e. err
		// The next funciton will make sure that this generated error will lands up in our global error middleware function
		fn(req, res, next).catch(next);
	};
}