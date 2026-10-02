const express = require("express");
const { publicRoute, requireAuth } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", publicRoute, userController.list);
router.get("/:id", publicRoute, userController.getById);
router.post("/", publicRoute, userController.create);
router.patch("/:id", requireAuth, userController.update);
router.delete("/:id", requireAuth, userController.remove);

module.exports = router;
