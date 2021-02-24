const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const userRouter = require('./router/userRouter');
const roomController = require('./router/roomRouter');

const app = express();

// parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(userRouter);
app.use('/room', roomController);

app.use(express.static(path.join(__dirname, '/public')));

module.exports = app;
