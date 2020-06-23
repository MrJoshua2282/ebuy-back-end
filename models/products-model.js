const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type: String, required: [true, 'product must have a title'] },
    description: { type: String, required: [true, 'product must have a description'] },
    price: { type: Number, required: [true, 'product must have a price'] },
    company: { type: String, required: [true, 'product must have a company'] },
    image: { type: String, required: [true, 'product must have an image'] },
    inventory: { type: Number, default: 0 },
    creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Product', productSchema);
