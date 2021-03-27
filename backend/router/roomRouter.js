const express = require('express');
const roomController = require('../controller/roomController');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/', userController.getUser, roomController.createRoom);
router.get('/', userController.getUser, roomController.getRooms);

module.exports = router;
