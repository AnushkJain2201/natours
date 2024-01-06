class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];

        // Deleting the following excluding fields from the object
        excludeFields.forEach(el => delete queryObj[el]);

        // 2) Advance filtering
        // Converting the query object to the string
        let queryStr = JSON.stringify(queryObj);

        // Calling the replace function to replace operator with corresponding MongoDB operator
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // console.log(JSON.parse(queryString));
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        // If req.query has a sort field than we call the sort method on the query object that we get from the Tour.find() method
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("_id");
        }

        return this;
    }

    limitFields() {
        if(this.queryString.fields) {
            const fieldsSend = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fieldsSend);
        } else {
            // Here we are excluding a field with the name __v as it is created by mongoose to use internally
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        
       return this;
    }
}

module.exports = APIFeatures;