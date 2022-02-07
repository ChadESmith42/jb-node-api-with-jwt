const express = require('express');
const cors = require('cors');

const employeesController = require('./_employees/employees.controller');
const notesController = require('./_notes/notes.controller');
const petsController = require('./_pets/pets.controller');
const reservationsController = require('./_reservations/reservations.controller');
const resortsController = require('./_resorts/resorts.controller');
const userController = require('./_users/users.controller');

const app = express();

const port = 3000;

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cors());

app.use('/api/employees', employeesController);
app.use('/api/notes', notesController);
app.use('/api/pets', petsController);
app.use('/api/reservations', reservationsController);
app.use('/api/resorts', resortsController);
app.use('/api/users', userController);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
