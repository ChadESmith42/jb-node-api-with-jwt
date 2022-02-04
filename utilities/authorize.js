const jwt = require('jsonwebtoken');
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

module.exports = authorize;
