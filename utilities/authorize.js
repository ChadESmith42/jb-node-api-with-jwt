const jwt = require('jsonwebtoken');
const role = require('./role');
require('dotenv').config();
const secret = process.env.SECRET;

const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
      console.groupEnd();
    });
  } else {
    res.sendStatus(401);
  }
};

/**
 * Validates user is either an Admin or an Employee.
 * @param {object} user
 * @returns {boolean} True if either role exists on the user object.
 */
const superUserOnly = user => {
  return user.role == role.Admin || user.role == role.Employee;
}

/**
 * Validates user is either an admin or is accessing their own records.
 * @param {object} user
 * @param {int} reqId
 * @returns {boolean} True if user is either an Admin or is accessing their own records.
 */
const userOrAdmin = (user, reqId) => {
  return user.role === role.Admin || (user.role === role.User && user.id === reqId);
}

/**
 * Validates authenticated user is not an Admin or Employee.
 * @param {object} user
 * @returns
 */
const userOnly = (user) => {
  return user.role === role.User;
}

module.exports = {authorize, superUserOnly, userOrAdmin, userOnly};
