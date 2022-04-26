const jwt = require("jsonwebtoken");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const UserModel = require("../models/user");
const {ROLE_EMPLOYEE, STATUS_UPLOAD_FILE_SUCCESS, DOCUMENT_TYPE_LOGO, ROLE_SUPERADMIN, ROLE_ADMIN} = require("../utils/constants");
const {uploadFile} = require("../uploads/UploadFile");
const DocumentModel = require("../models/document");
const AddressModel = require("../models/address");
const PersonModel = require("../models/person");
const ProjectModel = require("../models/project");
const documentModel = require("../models/document");

const personController = {};

personController.list = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        const products = await PersonModel.find().populate('user').populate('address').populate('avatar');
        return res.status(httpStatus.OK).json({
            items: products
        });
    } catch (e) {
        next(e)
    }
}

personController.create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        console.log(currentUser)
        if (![ROLE_SUPERADMIN, ROLE_ADMIN].includes(currentUser.role)) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Bạn không có quyền tạo tài khoản!'
            });
        }
        const form = new formidable.IncomingForm();
        form.multiples = true; //
        form.uploadDir = "uploads/";
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    email,
                    firstName,
                    lastName,
                    phoneNumber,
                    birthday,
                    gender,
                    address_description,
                    address_city,
                    address_country,
                    address_postalCode,
                    username,
                    password,
                    role
                } = fields;

                let checkPerson = await PersonModel.findOne({
                    email: email
                })
                if (checkPerson) {
                    return res.status(httpStatus.BAD_REQUEST).json({
                        message: 'Email đã tồn tại'
                    });
                }

                let userSaved = null;
                if (role !== ROLE_EMPLOYEE && currentUser.role === ROLE_ADMIN) {
                    return res.status(httpStatus.UNAUTHORIZED).json({
                        message: 'Bạn không có quyền tạo tài khoản cho role này!'
                    });
                }

                if (username) {
                    let user = await UserModel.findOne({
                        username: username
                    })
                    if (user) {
                        return res.status(httpStatus.BAD_REQUEST).json({
                            message: 'Tài khoản đã tồn tại'
                        });
                    }

                    //Hash password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    user = new UserModel({
                        username: username,
                        password: hashedPassword,
                        enabled: true,
                        role: role ?? ROLE_EMPLOYEE,
                    });
                    userSaved = await user.save();
                }
                const avatarTemp = files.avatar;
                let avatarSaved = null;
                if (avatarTemp) {
                    const fileData = {
                        fileName: avatarTemp.newFilename,
                        mimeType: avatarTemp.mimetype
                    }
                    const resUpload = await uploadFile(fileData);
                    if (resUpload.status === STATUS_UPLOAD_FILE_SUCCESS) {
                        const avatar = DocumentModel({
                            fileId: resUpload.fileId,
                            fileSize: avatarTemp.size,
                            fileName: avatarTemp.newFilename,
                            originalName: avatarTemp.originalFilename,
                            mimeType: avatarTemp.mimetype,
                            documentType: DOCUMENT_TYPE_LOGO
                        })
                        avatarSaved = await avatar.save();
                    }
                }


                const address = AddressModel({
                    description: address_description,
                    city: address_city,
                    country: address_country,
                    postalCode: address_postalCode,
                })
                const addressSaved = await address.save();
                const person = PersonModel({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phoneNumber: phoneNumber,
                    birthday: birthday,
                    gender: gender,
                    address: addressSaved ? addressSaved._id : null,
                    avatar: avatarSaved ? avatarSaved._id : null,
                    user: userSaved ? userSaved._id : null,
                })
                const personSaved = await person.save();
                const userUpdate = await UserModel.findOneAndUpdate({_id: userSaved._id}, {
                    person: personSaved._id
                })
                return res.status(httpStatus.OK).json({
                    data: personSaved,
                })
            } catch (e) {
                next(e)
                // return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                //     message: e.message
                // });
            }

        })
    } catch (e) {
        next(e)
    }
}

personController.edit = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        let productId = req.params.id;

        let person = await PersonModel.findById(productId).populate('user').populate('address').populate('avatar');
        if (person == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy nhân viên"
            });
        }
        const form = new formidable.IncomingForm();
        form.multiples = true; //
        form.uploadDir = "uploads/";
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    email,
                    firstName,
                    lastName,
                    phoneNumber,
                    birthday,
                    gender,
                    address_description,
                    address_city,
                    address_country,
                    address_postalCode,
                    username,
                    password,
                    role,
                    avatar
                } = fields;

                let checkPerson = await PersonModel.findOne({
                    email: email
                })
                // console.log(checkPerson._id, productId)
                // console.log('ss', checkPerson._id.toString() !== productId.toString())
                if (checkPerson && (checkPerson._id.toString() !== productId.toString())) {
                    return res.status(httpStatus.BAD_REQUEST).json({
                        message: 'Email đã tồn tại'
                    });
                }

                let userSaved = null;
                if (role !== ROLE_EMPLOYEE && currentUser.role === ROLE_ADMIN) {
                    return res.status(httpStatus.UNAUTHORIZED).json({
                        message: 'Bạn không có quyền tạo tài khoản cho role này!'
                    });
                }

                if (username) {
                    const userId = person.user?._id;
                    let user = await UserModel.findOne({
                        username: username
                    })
                    if (user && user._id.toString() !== userId.toString()) {
                        return res.status(httpStatus.BAD_REQUEST).json({
                            message: 'Tài khoản đã tồn tại'
                        });
                    }
                    if (userId) {
                        userSaved = await UserModel.findByIdAndUpdate(userId, {
                            username: username,
                            role: role,
                        })
                    } else {
                        //Hash password
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password, salt);
                        user = new UserModel({
                            username: username,
                            password: hashedPassword,
                            enabled: true,
                            role: role ?? ROLE_EMPLOYEE,
                        });
                        userSaved = await user.save();
                    }
                }
                let avatarSaved = null;
                if (avatar !== undefined) {
                    avatarSaved = await documentModel.findById(avatar);
                } else {
                    const avatarTemp = files.avatar;
                    if (avatarTemp) {
                        const fileData = {
                            fileName: avatarTemp.newFilename,
                            mimeType: avatarTemp.mimetype
                        }
                        const resUpload = await uploadFile(fileData);
                        if (resUpload.status === STATUS_UPLOAD_FILE_SUCCESS) {
                            const avatar = DocumentModel({
                                fileId: resUpload.fileId,
                                fileSize: avatarTemp.size,
                                fileName: avatarTemp.newFilename,
                                originalName: avatarTemp.originalFilename,
                                mimeType: avatarTemp.mimetype,
                                documentType: DOCUMENT_TYPE_LOGO
                            })
                            avatarSaved = await avatar.save();
                        }
                    }
                }
                const addressId = person.address?._id;
                const addressSaved = addressId ? await AddressModel.findByIdAndUpdate(addressId, {
                    description: address_description,
                    city: address_city,
                    country: address_country,
                    postalCode: address_postalCode,
                }) : await AddressModel({
                    description: address_description,
                    city: address_city,
                    country: address_country,
                    postalCode: address_postalCode,
                }).save();
                const personSaved = await PersonModel.findByIdAndUpdate(productId, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phoneNumber: phoneNumber,
                    birthday: birthday,
                    gender: gender,
                    address: addressSaved ? addressSaved._id : null,
                    avatar: avatarSaved ? avatarSaved._id : null,
                    user: userSaved ? userSaved._id : null,
                })
                console.log(personSaved)

                return res.status(httpStatus.OK).json({
                    data: personSaved,
                })
            } catch (e) {
                next(e)
                // return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                //     message: e.message
                // });
            }

        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

personController.show = async (req, res, next) => {
    try {
        let productId = req.params.id;

        let product = await PersonModel.findById(productId).populate('user').populate('address').populate('avatar');
        if (product == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy nhân viên"
            });
        }

        return res.status(httpStatus.OK).json({
            item: product
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}


module.exports = personController;
