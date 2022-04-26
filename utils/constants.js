require('dotenv').config();

const GENDER_MALE = 'male';
const GENDER_FEMALE = 'female';
const GENDER_SECRET = 'secret';

const ROLE_SUPERADMIN = 'superadmin';
const ROLE_ADMIN = 'admin';
const ROLE_EMPLOYEE = 'employee';

const STATUS_UPLOAD_FILE_SUCCESS = 'success';
const STATUS_UPLOAD_FILE_ERROR = 'error';

const DOCUMENT_TYPE_LOGO = 'logo';
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
module.exports = {
    GENDER_MALE,
    GENDER_FEMALE,
    GENDER_SECRET,
    ROLE_SUPERADMIN,
    ROLE_ADMIN,
    ROLE_EMPLOYEE,
    STATUS_UPLOAD_FILE_SUCCESS,
    STATUS_UPLOAD_FILE_ERROR,
    DOCUMENT_TYPE_LOGO,

    JWT_SECRET,
    MONGO_URI,
    PORT
}

