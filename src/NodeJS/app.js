const express = require('express');
var app = express()
require('custom-env').env(process.env.NODE_ENV, './config');
const mongoose = require('mongoose');
const user = require('./routes/user')
const categories = require("./routes/category");
const movie = require('./routes/movie')
const token = require('./routes/token')
const cors = require('cors')
const path = require("path");

mongoose.connect(process.env.CONNECTION_STRING);

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/api/users', user);
app.use('/api/movies', movie);
app.use('/api/tokens', token);
app.use("/api/categories", categories);

app.use('/Media', express.static(path.join(__dirname, 'Media')));

app.listen(process.env.PORT)