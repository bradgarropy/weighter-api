const mongoose = require('mongoose');


// define schema
const weightSchema = mongoose.Schema({
    user_id: { type: String, required: true, unique: false },
    date: { type: Date, required: true, unique: false },
    weight: { type: Number, required: true, unique: false },
});


// create model
const Weight = mongoose.model('Weight', weightSchema);


// exports
module.exports = Weight;
