const httpStatus = require("../utils/httpStatus");
const formidable = require("formidable");
const UserModel = require("../models/user");
const {ROLE_EMPLOYEE, STATUS_UPLOAD_FILE_SUCCESS, DOCUMENT_TYPE_LOGO, ROLE_SUPERADMIN, ROLE_ADMIN} = require("../utils/constants");
const {uploadFile} = require("../uploads/UploadFile");
const DocumentModel = require("../models/document");
const ProductModel = require("../models/product");
const ProductTypeModel = require("../models/productType");
const documentModel = require("../models/document");

const productController = {};

productController.list = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        const products = await ProductModel.find().populate('logo').populate('type');
        return res.status(httpStatus.OK).json({
            items: products
        });
    } catch (e) {
        next(e)
    }
}

productController.create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        if (![ROLE_SUPERADMIN, ROLE_ADMIN].includes(currentUser.role)) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Bạn không có quyền tạo sản phẩm!'
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
                    price,
                    vat,
                    type,
                    unit
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
                const typeFind = await ProductTypeModel.findById(type);
                console.log(typeFind)
                const product = ProductModel({
                    name: name,
                    code: code,
                    price: price,
                    vat: vat,
                    type: typeFind ? typeFind._id : null,
                    unit: unit,
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

productController.edit = async (req, res, next) => {
    try {
        let productId = req.params.id;
        console.log(productId)
        let product = await ProductModel.findById(productId);
        if (product == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy sản phẩm"
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
                    price,
                    vat,
                    type,
                    unit,
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
                const typeFind = await ProductTypeModel.findById(type);
                const productSaved = await ProductModel.findByIdAndUpdate(productId, {
                    name: name,
                    code: code,
                    price: price,
                    vat: vat,
                    type: typeFind ? typeFind._id : null,
                    unit: unit,
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

productController.show = async (req, res, next) => {
    try {
        let productId = req.params.id;

        let product = await ProductModel.findById(productId).populate('logo');
        if (product == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        return res.status(httpStatus.OK).json({
            item: product
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

productController.delete = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;
        let productType = await ProductModel.findByIdAndDelete(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấ sản phẩm"
            });
        }
        return res.status(httpStatus.OK).json({
            message: 'Xóa thành công sản phẩm',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

module.exports = productController;
