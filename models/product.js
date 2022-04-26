const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    logo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: false,
    },
    vat: {
        type: Number,
        required: false,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductType'
    },
    unit: {
        type: String,
        required: false,
    },
});
productSchema.set('timestamps', true);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
