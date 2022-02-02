const express = require('express');
const router = express.Router();
const userService = require('../_users/user.service');
const authorize = require('../utilities/authorize');
const Role = require('../utilities/role');
const res = require('express/lib/response');
const { user } = require('pg/lib/defaults');

const authenticate = async (req, res, next) => {
  try {
    const auth = await userService.authenticate(req.body);
    return res.status(200).json(auth);
  } catch (error) {
    console.log('Could not authenticate user from req.', req, error);
    return res
      .status(401)
      .json({ message: 'Username or password are incorrect.' });
  }
};

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    return res.status(200).json(users);
  } catch (error) {
    console.log(`Could not get all users.`, error);
    res.status(500);
  }
};

const getById = async (req, res, next) => {
  const authUser = req.user;
  const id = parseInt(req.params.id);

  if (id != authUser.sub && authUser.Role !== Role.Admin) {
    return res.sstatus(401).json({ message: 'Unauthorized.' });
  }
  try {
    const user = await userService.getById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(`Could not retrieve user by id`, error, user, id);
    res.status(500).json({ message: 'Could not retrieve user by id.', error });
  }
};

const register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    if (user) {
      const username = req.body.username;
      const password = req.body.password;
      const auth = await userService.authenticate({username, password});
       return res.status(200).json(auth);
      //res.status(201).json(user);
    } else {
      throw error;
    }
  } catch (error) {
    return res.status(400).json({ message: 'Could not register you at this time.', error });
  }

}

router.post('/authenticate', authenticate);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/register', register);

module.exports = router;
