const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    description: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    postalCode: {
        type: String,
        required: false,
    },
}, {
    timestamps: true
})

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
