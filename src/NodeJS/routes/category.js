const express = require("express");
var router = express.Router();

const categories = require("../controllers/category");
const authMiddleware = require("../middleware/auth");

router
  .get("/", categories.getCategories);
router
  .post("/", authMiddleware, categories.postCategory);
router
  .get("/:id", categories.getCategoryById);
router
  .patch("/:id", authMiddleware, categories.patchCategory);
router
  .delete("/:id", authMiddleware, categories.deleteCategory);

module.exports = router;
