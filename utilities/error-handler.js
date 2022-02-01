const res = require('express/lib/response');

module.exports = errorHandler;

const errorHandler = (err, req, resp, next) => {
  if (typeof (err) === 'string') {
    return res.status(400).json({ message: err});
  }

  if (err.name === 'UnauthorizedError') {
    return req.status(401).json({ message: 'Invalid Token'});
  }

  return res.status(500).json({ message: err.message });
}
