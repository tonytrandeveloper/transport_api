const httpStatus = require("../utils/httpStatus");
const formidable = require("formidable");
const UserModel = require("../models/user");
const {ROLE_SUPERADMIN, ROLE_ADMIN} = require("../utils/constants");
const ProjectTypeModel = require("../models/projectType");
const projectTypeController = {};

projectTypeController.list = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        const products = await ProjectTypeModel.find();
        return res.status(httpStatus.OK).json({
            items: products
        });
    } catch (e) {
        next(e)
    }
}

projectTypeController.create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        if (![ROLE_SUPERADMIN, ROLE_ADMIN].includes(currentUser.role)) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Bạn không có quyền tạo loại dự án!'
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

                const productType = ProjectTypeModel({
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

projectTypeController.edit = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;

        let productType = await ProjectTypeModel.findById(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại dự án"
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
                const productTypeSaved = await ProjectTypeModel.findByIdAndUpdate(productTypeId, {
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

projectTypeController.show = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;

        let productType = await ProjectTypeModel.findById(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại dự án"
            });
        }

        return res.status(httpStatus.OK).json({
            item: productType
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

projectTypeController.delete = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;
        let productType = await ProjectTypeModel.findByIdAndDelete(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại dự án"
            });
        }
        return res.status(httpStatus.OK).json({
            message: 'Xóa thành công loại dự án',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

module.exports = projectTypeController;
