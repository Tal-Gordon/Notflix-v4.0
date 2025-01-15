const express = require('express');
var router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

router.route('/')
    .post(userController.createUser);
router.route('/:id')
    .get(authMiddleware, userController.getUser);

module.exports = router;