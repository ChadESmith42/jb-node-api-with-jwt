require('dotenv').config();
const secret = process.env.SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pg = require('../utilities/db.context');

/**
 * Authenticates users with username and password.
 * @param {object} loginCredentials Username and password as an object.
 * @returns @param {object} authenticatedUser. Authenticated user model omits user password, but contains all other properties of the user object. Authenticated user also contains the JWT token.
 */
const authenticate = async ({ username, password }) => {
  const pword = password;
  try {
    const results = await pg.query(
      `SELECT id, username, password, "firstName", "lastName", email, role FROM users WHERE users.username=$1;`,
      [username]
    );
    const u = results.rows[0];
    if (u) {
      if (!bcrypt.compareSync(pword, u.password)) {
        return null;
      }

      const payload = {
        sub: u.id,
        role: u.role,
      };
      //const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      const token = jwt.sign({ sub: u.id, role: u.role }, secret);
      const { password, id, ...user } = u;
      return { user, token };
    }
  } catch (error) {
    console.error(`Error authenticating user.`, error);
    return null;
  }
};

/**
 * Gets all users from database.
 * @returns {array} Array of User objects.
 */
const getAll = async () => {
  try {
    const users = await pg.query(
      `SELECT username, "firstName", "lastName", email, role FROM users;`,
      []
    );
    return users.rows;
  } catch (error) {
    return null;
  }
};

/**
 * Get a user by id.
 * @param {int} userId
 * @returns
 */
const getById = async (userId) => {
  const user = await pg.query(
    `SELECT username, "firstName", "lastName", email, role FROM users WHERE users.id=$1;`,
    [userId]
  );
  if (!user) return;
  return user.rows[0];
};

/**
 * Register a new user for the application.
 * @param {object} user
 * @returns {Promise<unknown>} User object.
 */
const register = async (user) => {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  const defaultRole = 'user';
  const response = await pg.query(
    `
    INSERT INTO users ("firstName", "lastName", "avatar_link", username, password, email, role )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `,
    [
      user.firstName,
      user.lastName,
      user.avatarLink,
      user.username,
      hashedPassword,
      user.email,
      defaultRole,
    ]
  );

  const { password, ...newUser } = response.rows[0];

  return newUser;
};

/**
 * Update user password.
 * @param {string} newPassword
 * @param {int} userId
 * @returns {object} User. The returned User object does not include the User.Password property.
 */
const updatePassword = async (newPassword, userId) => {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const response = await pg.query(
    `
      UPDATE users SET password = $1 WHERE id = $2
      RETURN *;
      `,
    [hashedPassword, userId]
  );
  const { password, ...updatedUser } = response.rows[0];
  return updatedUser;
};

/**
 * Update user first name, last name, avatar link, or email.
 * @param {object} user
 * @param {int} userId
 */
const updateUser = async (user, userId) => {
  try {
    const response = await pg.query(
      `
    UPDATE users SET "firstName" = $1, "lastName" = $2, "avatar_link" = $3, email = $4
      WHERE id = $5
      RETURN *; `,
      [user.firstName, user.lastName, user.avatarLink, user.email, userId]
    );
    return response.rows[0];
  } catch (error) {
    console.error('Could not update user.', error);
    return null;
  }
};

/**
 * Delete user from database.
 * @param {int} userId
 * @returns  {int} Row count of affected records.
 */
const deleteUser = async (userId) => {
  const response = await pg.query(
    `
    DELETE FROM users WHERE id = $1;
  `,
    [userId]
  );
  if (response) {
    return response.rowCount;
  }
};

module.exports = {
  authenticate,
  getAll,
  getById,
  register,
  updatePassword,
  updateUser,
  deleteUser,
};
