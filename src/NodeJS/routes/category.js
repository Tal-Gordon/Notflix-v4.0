const express = require("express");
var router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuth");
const categories = require("../controllers/category");
const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, categories.getCategories);
router.post("/", authMiddleware, adminAuthMiddleware, categories.postCategory);
router.get("/:id", authMiddleware, categories.getCategoryById);
router.patch(
  "/:id",
  authMiddleware,
  adminAuthMiddleware,
  categories.patchCategory
);
router.delete(
  "/:id",
  authMiddleware,
  adminAuthMiddleware,
  categories.deleteCategory
);

module.exports = router;
