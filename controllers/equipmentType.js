const httpStatus = require("../utils/httpStatus");
const formidable = require("formidable");
const UserModel = require("../models/user");
const {ROLE_SUPERADMIN, ROLE_ADMIN} = require("../utils/constants");
const EquipmentTypeModel = require("../models/equipmentType");
const equipmentTypeController = {};

equipmentTypeController.list = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        const products = await EquipmentTypeModel.find();
        return res.status(httpStatus.OK).json({
            items: products
        });
    } catch (e) {
        next(e)
    }
}

equipmentTypeController.create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const currentUser = await UserModel.findById(userId);
        if (![ROLE_SUPERADMIN, ROLE_ADMIN].includes(currentUser.role)) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Bạn không có quyền tạo loại thiết bị!'
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

                const productType = EquipmentTypeModel({
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

equipmentTypeController.edit = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;

        let productType = await EquipmentTypeModel.findById(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại thiết bị"
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
                const productTypeSaved = await EquipmentTypeModel.findByIdAndUpdate(productTypeId, {
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

equipmentTypeController.show = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;

        let productType = await EquipmentTypeModel.findById(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại thiết bị"
            });
        }

        return res.status(httpStatus.OK).json({
            item: productType
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

equipmentTypeController.delete = async (req, res, next) => {
    try {
        let productTypeId = req.params.id;
        let productType = await EquipmentTypeModel.findByIdAndDelete(productTypeId);
        if (productType == null) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Không tìm thấy loại thiết bị"
            });
        }
        return res.status(httpStatus.OK).json({
            message: 'Xóa thành công loại thiết bị',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

module.exports = equipmentTypeController;
