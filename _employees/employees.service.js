const pg = require('../utilities/db.context');

/**
 * Get all employees, with user data.
 * @returns {array} Employee-user model.
 */
const getEmployees = async () => {
  try {
    const employees = await pg.query(`
      SELECT *
      FROM employees
      JOIN users ON employees.users_id = users.id;
    `);
    return employees.rows || [];
  } catch (error) {
    console.error('Could not retrieve employees.', error);
    return null;
  }
}

/**
 * Get an Employee-User model by Employee id.
 * @param {int} id Employee id
 * @returns {object} Employee-User model
 */
const getEmployeeById = async id => {
  try {
    const employee = await pg.query(`
      SELECT *
      FROM employees
      JOIN users ON employees.users_id = users.id
      WHERE employees.id = $1;
    `, [id]);
    return employee.rows[0];
  } catch (error) {
    console.error(`Could not retrieve employee by id ${id}.`, error);
    return null;
  }
}

/**
 * Create a new employee.
 * @param {object} employee { users_id, hire_date, title }
 * @returns {object} Employee-User model or null.
 */
const createEmployee = async employee => {
  let response;
  try {
    await pg.query('BEGIN');
    const newEmployee = await pg.query(`
      INSERT INTO employees (users_id, hire_date, title, status)
      VALUES ($1, $2, $3, $4);
    `, [employee.users_id, employee.hire_date, employee.title, employee.status]);
    if (newEmployee.rows) {
      response = await getEmployeeById(employee.users_id);
      await pg.query('COMMIT');
      return response || null;
    }
  } catch (error) {
    console.error(`Could not create new employee.`, employee, error);
    await pg.query('ROLLBACK');
    return null;
  }
}

/**
 * Update an employee object
 * @param {object} employee
 * @returns {object} Employee-User model or null.
 */
const updateEmployee = async employee => {
  let response;
  try {
    await pg.query('BEGIN');
    const updatedEmployee = await pg.query(`
      UPDATE employees
      SET hire_date = $1, title = $2, status = $3
      WHERE id = $4;
    `, [employee.hire_date, employee.title, employee.status, employee.id]);
    response = await getEmployeeById(employee.id);
    await pg.query('COMMIT');
    return response || null;
  } catch (error) {
    console.error(`Could not update employee with id ${employee.id}.`, error);
    await pg.query('ROLLBACK');
    return null;
  }
}

/**
 * Delete employee with option to delete related user.
 * @param {int} employeeId Employee id.
 * @param {boolean} canDeleteUser Delete the related user model.
 * @returns {int} Returns row count of deleted user records or null.
 */
const deleteEmployee = async (employeeId, canDeleteUser) => {
  try {
    let user;
    await pg.query('BEGIN');
    if (canDeleteUser) {
      user = await getEmployeeById(employeeId);
    }
    const deleteEmployee = await pg.query(`
      DELETE employees
      WHERE id = $1;
    `, [employeeId]);
    if (user) {
      const deleteUser = await pg.query(`
        DELETE users
        WHERE id = $1;
      `, [user.user_id]);
    }
    await pg.query('COMMIT');
    return deleteEmployee.rowCount;
  } catch (error) {
    console.error(`Could not delete employee.`, error);
    await pg.query('ROLLBACK');
    return null;
  }
}

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee };
