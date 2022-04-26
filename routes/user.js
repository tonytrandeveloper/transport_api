const userController = require("../controllers/user");
const {asyncWrapper} = require("../utils/asyncWrapper");
const express = require("express");
const usersRoutes = express.Router();
const auth = require("../middlewares/auth");

usersRoutes.post(
    "/login",
    asyncWrapper(userController.login)
);

module.exports = usersRoutes;
