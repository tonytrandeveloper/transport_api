const express = require("express");
const userRoutes = require("../user");
const personRoutes = require("../person");
const productRoutes = require("../product");
const productTypeRoutes = require("../productType");
const equipmentRoutes = require("../equipment");
const equipmentTypeRoutes = require("../equipmentType");
const projectRoutes = require("../project");
const projectTypeRoutes = require("../projectType");

const apiRoutes = express.Router();

apiRoutes.use("/user", userRoutes);
apiRoutes.use("/person", personRoutes);
apiRoutes.use("/product", productRoutes);
apiRoutes.use("/productType", productTypeRoutes);
apiRoutes.use("/equipment", equipmentRoutes);
apiRoutes.use("/equipmentType", equipmentTypeRoutes);
apiRoutes.use("/project", projectRoutes);
apiRoutes.use("/projectType", projectTypeRoutes);


apiRoutes.get(
    "/", (req, res) => res.json({ api: "is-working" })
);
module.exports = apiRoutes;
