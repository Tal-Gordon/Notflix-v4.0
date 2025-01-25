const express = require("express");
var router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuth");
const categories = require("../controllers/category");

router.get("/", categories.getCategories);
router.post("/", adminAuthMiddleware, categories.postCategory);
router.get("/:id", categories.getCategoryById);
router.patch("/:id", adminAuthMiddleware, categories.patchCategory);
router.delete("/:id", adminAuthMiddleware, categories.deleteCategory);

module.exports = router;
