const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema({
    firstName: { type: String, required: [true, 'user must have a first name'] },
    lastName: { type: String, required: [true, 'user must have a last name'] },
    email: { type: String, required: [true, 'user must have an email'], unique: true },
    password: { type: String, required: [true, 'user must have a password'] },
    products: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }]
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);