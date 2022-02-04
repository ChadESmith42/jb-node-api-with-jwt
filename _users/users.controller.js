const express = require('express');
const router = express.Router();
const userService = require('../_users/user.service');
const { authService, filterPassword } = require('../utilities');

const authenticateUser = async (req, res, next) => {
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
    const authUser = req.user;
    if (!authService.superUserOnly(authUser)) return res.sendStatus(401);
    const users = await userService.getAll();
    res.send(filterPassword(users));
  } catch (error) {
    console.log(`Could not get all users.`, error);
    res.status(500);
  }
};

const getById = async (req, res, next) => {
  const authUser = req.user;
  const id = parseInt(req.params.id);

  if (!authService.userOrAdmin(authUser, id)) {
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

const updatePassword = async (req, res) => {
  try {
      const authUser = req.user;
      const password = req.body.password;
      const updatedUser = await userService.updatePassword(password, authUser.id);
      if (updatedUser) {
        res.status(200);
      }
  } catch (error) {
    console.log(`Could not update user's password.`, error);
    res.status(500);
  }
}

const updateUser = async (req, res) => {
  const authUser = req.user;
  const user = req.body;
  const userId = req.params.id;
  if (userId !== authUser.id || userId !== user.id) return res.sendStatus(403); // Return forbidden if userId's don't match
  try {
    if (authService.userOrAdmin(authUser, userId)) {
      return res.status(401).json('Unauthorized.');
    }
    const responseUser = await userService.updateUser(user, userId);
    const { password, ...updatedUser } = responseUser.rows[0];
    return res.send(updatedUser);
  } catch (error) {
    console.log(`Could not update user.`, error);
    res.status(500).json({ message: 'Could not update user at this time.' });
  }
}

const deleteUser = async (req, res) => {
  try {
    const authUser = req.user;
    const userId = req.params.id;
    // Check user against auth or Admin role
    if (!authService.userOrAdmin(authUser, userId)) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    const response = await userService.deleteUser(userId);
    if (response) {
      return res.status(204);
    }
  } catch (error) {
    console.log(`Could not delete user.`, error);
    return res.status(500).json({ message: 'Could not delete user. Please try again later.' });
  }
}

router.post('/authenticate', authenticateUser);
router.get('/', authService.authorize, getAll);
router.get('/:id', authService.authorize, getById);
router.post('/register', register);
router.put('/:id/password', authService.authorize, updatePassword);
router.put('/:id', authService.authorize, updateUser);
router.delete('/:id', authService.authorize, deleteUser);

module.exports = router;
