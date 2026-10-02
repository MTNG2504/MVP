const express = require("express");
const healthRoutes = require("./healthRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);

module.exports = router;
