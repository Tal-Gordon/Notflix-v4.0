const express = require('express');
var router = express.Router();
const userController = require('../controllers/user');
const { authMiddleware } = require("../middleware/auth");
const multer  = require('multer')

const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .post(upload.single('picture'), userController.createUser);
router.route('/:id')
    .get(authMiddleware, userController.getUser);

module.exports = router;