const express = require('express');
var router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

const path = require('path');
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'Media'); // Save the file in this folder
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Set unique filename
    }
  });

const upload = multer({ storage: storage });

router.route('/')
    .post(upload.single('picture'), userController.createUser);
router.route('/:id')
    .get(authMiddleware, userController.getUser);

module.exports = router;