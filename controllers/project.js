const httpStatus = require("../utils/httpStatus");
const formidable = require("formidable");
const UserModel = require("../models/user");
const {ROLE_EMPLOYEE, STATUS_UPLOAD_FILE_SUCCESS, DOCUMENT_TYPE_LOGO, ROLE_SUPERADMIN, ROLE_ADMIN} = require("../utils/constants");
const {uploadFile} = require("../uploads/UploadFile");
const DocumentModel = require("../models/document");
const ProjectModel = require("../models/project");
const ProjectTypeModel = require("../models/projectType");
const documentModel = require("../models/document");

const projectController = {};

projectController.list = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        const products = await ProjectModel.find().populate('logo').populate('type');
        return res.status(httpStatus.OK).json({
            items: products
        });
    } catch (e) {
        next(e)
    }
}

projectController.create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        if (![ROLE_SUPERADMIN, ROLE_ADMIN].includes(currentUser.role)) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Bạn không có quyền tạo dự án!'
            });
        }
        const form = new formidable.IncomingForm();
        form.multiples = true; //
        form.uploadDir = "uploads/";
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    name,
                    code,
                    description,
                    startDate,
                    type,
                    endDate,
                    days,
                    amount
                } = fields;
                console.log(fields)
                const logoTemp = files.logo;
                let logoSaved = null;
                if (logoTemp) {
                    const fileData = {
                        fileName: logoTemp.newFilename,
                        mimeType: logoTemp.mimetype
                    }
                    const resUpload = await uploadFile(fileData);
                    if (resUpload.status === STATUS_UPLOAD_FILE_SUCCESS) {
                        const avatar = DocumentModel({
                            fileId: resUpload.fileId,
                            fileSize: logoTemp.size,
                            fileName: logoTemp.newFilename,
                            originalName: logoTemp.originalFilename,
                            mimeType: logoTemp.mimetype,
                            documentType: DOCUMENT_TYPE_LOGO
                        })
                        logoSaved = await avatar.save();
                    }
                }
                const typeFind = await ProjectTypeModel.findById(type);
                console.log(typeFind)
                const product = ProjectModel({
                    name: name,
                    code: code,
                    description: description,
                    startDate: startDate,
                    endDate: endDate,
                    days: days,
                    amount: amount,
                    type: typeFind ? typeFind._id : null,
                    logo: logoSaved ? logoSaved._id : null,
                })
                const productSaved = await product.save();
                if (productSaved) {
                    return res.status(httpStatus.OK).json({
                        item: productSaved,
                    })
                } else {
                    return res.status(httpStatus.BAD_REQUEST).json({
                        message: 'Error'
                    })
                }
            } catch (e) {
                next(e)
            }
        })
    } catch (e) {
        next(e)
    }
}

projectController.edit = async (req, res, next) => {
    try {
        let productId = req.params.id;
        console.log(productId)
        let product = await ProjectModel.findById(productId);
        if (product == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy dự án"
            });
        }

        const form = new formidable.IncomingForm();
        form.multiples = true; //
        form.uploadDir = "uploads/";
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    name,
                    code,
                    description,
                    startDate,
                    type,
                    endDate,
                    days,
                    amount,
                    logo
                } = fields;
                let logoSaved = null;
                if (logo !== undefined) {
                   logoSaved = await documentModel.findById(logo);
                } else {
                    const logoTemp = files.logo;
                    if (logoTemp) {
                        const fileData = {
                            fileName: logoTemp.newFilename,
                            mimeType: logoTemp.mimetype
                        }
                        const resUpload = await uploadFile(fileData);
                        if (resUpload.status === STATUS_UPLOAD_FILE_SUCCESS) {
                            const avatar = DocumentModel({
                                fileId: resUpload.fileId,
                                fileSize: logoTemp.size,
                                fileName: logoTemp.newFilename,
                                originalName: logoTemp.originalFilename,
                                mimeType: logoTemp.mimetype,
                                documentType: DOCUMENT_TYPE_LOGO
                            })
                            logoSaved = await avatar.save();
                        }
                    }
                }
                const typeFind = await ProjectTypeModel.findById(type);
                const productSaved = await ProjectModel.findByIdAndUpdate(productId, {
                    name: name,
                    code: code,
                    description: description,
                    startDate: startDate,
                    endDate: endDate,
                    days: days,
                    amount: amount,
                    type: typeFind ? typeFind._id : null,
                    logo: logoSaved ? logoSaved._id : null,
                });
                if (productSaved) {
                    return res.status(httpStatus.OK).json({
                        item: productSaved,
                    })
                } else {
                    return res.status(httpStatus.BAD_REQUEST).json({
                        message: 'Error'
                    })
                }
            } catch (e) {
                next(e)
            }
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

projectController.show = async (req, res, next) => {
    try {
        let productId = req.params.id;

        let product = await ProjectModel.findById(productId).populate('logo');
        if (product == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy dự án"
            });
        }

        return res.status(httpStatus.OK).json({
            item: product
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

projectController.delete = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;
        let productType = await ProjectModel.findByIdAndDelete(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấ dự án"
            });
        }
        return res.status(httpStatus.OK).json({
            message: 'Xóa thành công dự án',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

module.exports = projectController;
