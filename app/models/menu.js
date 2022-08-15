const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    name: {type: String, required: true},
    image: {type: String, required: false},
    price: {type: Number, required: true},
    size: {type: String, required: true},
    available: {type: Boolean, required: true}
});

module.exports = mongoose.model('Menu', menuSchema);