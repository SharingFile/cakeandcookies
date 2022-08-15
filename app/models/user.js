const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    phone: {type: Number, required: true, unique: true, maxlength: 10},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, default: 'customer'},
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);