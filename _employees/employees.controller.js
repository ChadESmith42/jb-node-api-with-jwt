const express = require('express');
const router = express.Router();
const employeeService = require('./employees.service');
const authService = require('../utilities/authorize');
const filterPassword = require('../utilities/filter-password');

const getEmployees = async (req, res) => {
  const authUser = req.user;
  const employees = await employeeService.getEmployees();
  if (employees) {
    filteredEmployees = employees.map(e => {
      return filterPassword(e);
    })
    res.send(filteredEmployees);
  }
  res.sendStatus(500);
}

const getEmployeeById = async (req, res) => {
  const employeeId = req.params.id;
  const employee = await employeeService.getEmployeeById(employeeId);
  if (employee) {
    res.send(filterPassword(employee));
  }
  res.send(404);
}

const createEmployee = async (req, res) => {
  const employee = req.body;
  const newEmployee = await employeeService.createEmployee(employee);
  if (newEmployee) {
    res.send(filterPassword(newEmployee));
  }
  res.send(500);
}

const updateEmployee = async (req, res) => {
  const employeeId = req.params.id;
  const employee = req.body;
  if (employeeId !== employee.id) {
    res.sendStatus(403);
  }
  const updatedEmployee = await employeeService.updateEmployee(employee);
  if (updatedEmployee) {
    res.send(filterPassword(updatedEmployee));
  }
  res.send(500);
}

const deleteEmployee = async (req, res) => {
  const employeeId = req.params.id;
  const result = await employeeService.deleteEmployee(employeeId);
  if (result) {
    res.sendStatus(204);
  }
  res.sendStatus(500);
}

router.get('/employees', authService.adminOnly, getEmployees);
router.get('/employees/id', authService.adminOnly, getEmployeeById);
router.post('/employees', authService.adminOnly, createEmployee);
router.put('/employees/:id', authService.adminOnly, updateEmployee);
router.delete('/employees/:id', authService.adminOnly, deleteEmployee);

module.exports = router;
