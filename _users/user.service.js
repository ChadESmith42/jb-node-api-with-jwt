require('dotenv').config();
const secret = process.env.SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pg = require('../utilities/db.context');

const authenticate = async ({ username, password }) => {
  const pword = password;
  try {
    const results = await pg.query(
      `SELECT username, password, "firstName", "lastName", email, role FROM users WHERE users.username=$1;`,
      [username]
    );
    const u = results.rows[0];
    if (u) {
      if (!bcrypt.compareSync(pword, u.password)) {
        return null;
      }
      const token = jwt.sign({ sub: u.id, role: u.role }, secret);
      const { password, ...user } = u;
      return { user, token };
    }
  } catch (error) {
    console.log(`Error authenticating user.`, error);
    return null;
  }
};

const getAll = async () => {
  const users = await pg.query(
    `SELECT username, firstName, lastName, email, role FROM users;`,
    []
  );
  return users;
};

const getById = async (userId) => {
  const user = await pg.query(
    `SELECT username, firstName, lastName, email, role FROM users WHERE users.id=$1;`,
    [userId]
  );

  if (!user) return;

  return user;
};

/**
 * Register a new user for the application.
 * @param {*} user
 * @returns
 */
const register = async (user) => {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  const defaultRole = 'user';
  const response = await pg.query(`
    INSERT INTO users ("firstName", "lastName", "avatar_link", username, password, email, role )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `, [user.firstName, user.lastName, user.avatarLink, user.username, hashedPassword, user.email, defaultRole ]);

  const { password, ...newUser} = response.rows[0];

  return newUser;
}


module.exports = {
  authenticate,
  getAll,
  getById,
  register
};
