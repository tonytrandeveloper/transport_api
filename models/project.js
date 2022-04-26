const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
    description: {
        type: String,
        required: false,
    },
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
        required: false,
    },
    days: {
        type: Number,
        required: false,
    },
    amount: {
        type: Number,
        required: false,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectType'
    },
});
projectSchema.set('timestamps', true);
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
