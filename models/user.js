const mongoose = require('mongoose');
const {ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_EMPLOYEE} = require("../utils/constants");

const userSchema = new mongoose.Schema({
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 30,
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Password must be required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    enabled: {
        type: Boolean,
        required: true,
        default: true
    },
    role: {
        type: String,
        enum: [
            ROLE_SUPERADMIN,
            ROLE_ADMIN,
            ROLE_EMPLOYEE
        ],
        default: ROLE_EMPLOYEE,
    }
});
userSchema.set('timestamps', true);
const User = mongoose.model('User', userSchema);

module.exports = User;
