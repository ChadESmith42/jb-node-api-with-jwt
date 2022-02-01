require(dotenv).config();
const secret = process.env.SECRET;
const jwt = require('jsonwebtoken');
const Role = require('../utilities/role');
const pg = require('../utilities/db.context');
const { use } = require('express/lib/application');

module.exports = {
  authenticate,
  getAll,
  getById
}



const authenticate = async ({ username, password }) => {
  try {
    const user = await pg.query(
      `SELECT username, firstName, lastName, email, roles FROM users WHERE users.username=$1 AND users.password=$2`,
      [username, password]
    );
    if (user) {
      const token = jwt.sign({ sub: user.id, role: user.role }, secret);
      return { user, token };
    }
  } catch (error) {
    console.log(`Error authenticating user.`, error);
  }

}

const getAll = async () => {
  const users = await pg.query(
    `SELECT username, firstName, lastName, email, roles FROM users`,
    []
  );
  return users;
}

const getById = async (userId) => {
  const user = await pg.query(
    `SELECT username, firstName, lastName, email, roles FROM users WHERE users.id=$1`,
    [userId]
  );

  if (!user) return;

  return user;
}
