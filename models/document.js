const mongoose = require('mongoose');
const {DOCUMENT_TYPE_LOGO} = require("../utils/constants");
const documentSchema = new mongoose.Schema({
    fileId: {
        type: String,
        required: false,
    },
    fileSize: {
        type: Number,
        required: false,
    },
    fileName: {
        type: String,
        required: false,
    },
    originalName: {
        type: String,
        required: false,
    },
    mimeType: {
        type: String,
        required: false,
    },
    documentType: {
        type: String,
        enum: [
            DOCUMENT_TYPE_LOGO,
        ],
        required: true,
    }
});
documentSchema.set('timestamps', true);
const Address = mongoose.model('Document', documentSchema);

module.exports = Address;
