const mongoose = require('mongoose');
const {GENDER_MALE, GENDER_FEMALE, GENDER_SECRET} = require("../utils/constants");

const personSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    birthday: {
        type: Date,
    },
    gender: {
        type: String,
        enum: [
            GENDER_MALE,
            GENDER_FEMALE,
            GENDER_SECRET
        ],
        required: true,
        default: GENDER_SECRET,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
});
personSchema.set('timestamps', true);
const Person = mongoose.model('Person', personSchema);

module.exports = Person;
