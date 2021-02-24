const express = require('express');
const userController = require('../controller/userController');

const router = express.Router();

router.post('/signup', userController.signup);
router.get('/login/:name', userController.login);
router.get('/user', async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    user: await userController.getUser(req.cookies.token)
  });
});

module.exports = router;
