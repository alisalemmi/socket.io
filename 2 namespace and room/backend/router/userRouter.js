const express = require('express');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/signup', userController.signup);
router.get('/login/:name', userController.login);
router.get('/user', userController.getUser);

module.exports = router;
