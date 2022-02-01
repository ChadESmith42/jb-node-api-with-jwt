const express = require('express');
const cors = require('cors');
const errorHandler = require('./utilities/error-handler');
const userController = require('./_users/users.controller');

const app = express();

const port = 3000;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cors());

app.use('/api/users', userController);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
