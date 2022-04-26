const jwt = require("jsonwebtoken");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const UserModel = require('../models/user')
const {JWT_SECRET} = require("../utils/constants");
const formidable = require("formidable");
const userController = {};
userController.login = async (req, res, next) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    username,
                    password
                } = fields;
                const user = await UserModel.findOne({
                    username: username
                }).populate({
                    path : 'person',
                    populate : {
                        path : 'address',
                    }
                }).populate({
                    path : 'person',
                    populate : {
                        path : 'avatar',
                        // select: ['fileId']
                    }
                })
                if (!user) {
                    return res.status(httpStatus.BAD_REQUEST).json({
                        message: 'Username or password incorrect'
                    });
                }

                // password
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(httpStatus.BAD_REQUEST).json({
                        message: 'Username or password incorrect'
                    });
                }

                // login success

                // create and assign a token
                const token = jwt.sign(
                    {username: user.username, role: user.role, id: user._id},
                    JWT_SECRET
                );
                const dataPerson = user.person;
                const data = {
                    _id: user._id,
                    enabled: user.enabled,
                    username: user.username,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    person: dataPerson ? dataPerson : null
                }
                return res.status(httpStatus.OK).json({
                    data: data,
                    token: token
                })
            } catch (e) {
                next(e);
            }
        })
    } catch (e) {
        next(e);
    }
}

module.exports = userController;
