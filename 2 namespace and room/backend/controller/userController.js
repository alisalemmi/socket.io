const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const JWT_SECRET =
  'JWT secret for chat app project. this app is is created for learning socket.io :)';

const getToken = id => {
  const token = jwt.sign({ id }, JWT_SECRET, {
    expiresIn: 7776000000
  });

  return {
    token,
    option: { httpOnly: true, maxAge: 7776000000 }
  };
};

const decodeToken = token => {
  return jwt.verify(token, JWT_SECRET);
};

exports.signup = async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    image: req.body.image
  });

  const { token, option } = getToken(user.id);

  res
    .status(201)
    .cookie('token', token, option)
    .json({ status: 'success', user });
};

exports.login = async (req, res, next) => {
  const user = await User.findOne({ name: req.params.name });

  if (!user)
    return res
      .status(401)
      .json({ status: 'fail', message: 'user name does not exists :(' });

  const { token, option } = getToken(user.id);

  res
    .status(200)
    .cookie('token', token, option)
    .json({ status: 'success', user });
};

exports.getUser = async token => {
  let user;

  try {
    const { id } = decodeToken(token);

    user = await User.findById(id);
  } catch (err) {
    user = undefined;
  }

  return user;
};
