const httpStatus = require("../utils/httpStatus");
const formidable = require("formidable");
const UserModel = require("../models/user");
const {ROLE_SUPERADMIN, ROLE_ADMIN} = require("../utils/constants");
const ProductTypeModel = require("../models/productType");
const productTypeController = {};

productTypeController.list = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        const productTypes = await ProductTypeModel.find();
        return res.status(httpStatus.OK).json({
            items: productTypes
        });
    } catch (e) {
        next(e)
    }
}

productTypeController.create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        if (![ROLE_SUPERADMIN, ROLE_ADMIN].includes(currentUser.role)) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Bạn không có quyền tạo loại sản phẩm!'
            });
        }
        const form = new formidable.IncomingForm();
        form.multiples = true; //
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    name,
                    code,
                } = fields;

                const productType = ProductTypeModel({
                    name: name,
                    code: code,
                })
                const productTypeSaved = await productType.save();
                return res.status(httpStatus.OK).json({
                    item: productTypeSaved,
                })
            } catch (e) {
                next(e)
            }
        })
    } catch (e) {
        next(e)
    }
}

productTypeController.edit = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;

        let productType = await ProductTypeModel.findById(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại sản phẩm"
            });
        }
        const form = new formidable.IncomingForm();
        form.multiples = true;
        form.parse(req,  async function (err, fields, files) {
            try {
                const {
                    name,
                    code,
                } = fields;
                const productTypeSaved = await ProductTypeModel.findByIdAndUpdate(productTypeId, {
                    name: name,
                    code: code,
                });
                return res.status(httpStatus.OK).json({
                    item: productTypeSaved,
                })
            } catch (e) {
                next(e)
            }
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

productTypeController.show = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;

        let productType = await ProductTypeModel.findById(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại sản phẩm"
            });
        }

        return res.status(httpStatus.OK).json({
            item: productType
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

productTypeController.delete = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;
        let productType = await ProductTypeModel.findByIdAndDelete(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại sản phẩm"
            });
        }
        return res.status(httpStatus.OK).json({
            message: 'Xóa thành công loại sản phẩm',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

module.exports = productTypeController;
