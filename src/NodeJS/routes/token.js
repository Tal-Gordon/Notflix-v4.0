const express = require('express');
var router = express.Router();
const userController = require('../controllers/user');

router.route('/')
    .post(userController.isUserRegistered);

module.exports = router;