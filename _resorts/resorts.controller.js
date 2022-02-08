const express = require('express');
const router = express.Router();
const resortService = require('./resorts.service');
const { authService } = require('../utilities');

const getResorts = async (req, res) => {
  try {
    const resorts = await resortService.getResorts();
    if (resorts) res.send(resorts);
  } catch (error) {
    res.sendStatus(400);
  }
}

const getResortById = async (req, res) => {
 try {
  const resortId = req.params.id;
  const resort = await resortService.getResortsById(resortId);
  if (resort) res.send(resort);
 } catch (error) {
  res.sendStatus(400);
 }
}

const createResort = async (req, res) => {
  try {
    const newResort = req.body;
    const authUser = req.user;
    if (authService.adminOnly(authUser)) {
      const resort = await resortService.createResort(newResort);
      res.send(newResort);
    }
    res.sendStatus(403);
  } catch (error) {
    console.error('Could not create new resort', error);
    res.sendStatus(500);
  }
}

const updateResort = async (req, res) => {
  try {
    const updateResort = req.body;
    const resortId = req.params.id;
    const authUser = req.user;
    if (authService.adminOnly(authUser)) {
      const resort = await resortService.updateResort(updateResort, resortId);
      res.send(resort);
    }
    res.sendStatus(403);
  } catch (error) {
    console.error(`Could not update resort with id ${resortId}.`, error);
  }
}

const deleteResort = async (req, res) => {
  try {
    const resortId = req.params.id;
    const authUser = req.user;
    if (authService.adminOnly(authUser)) {
      const result = await resortService.deleteResort(resortId);
      res.send(result);
    }
    res.sendStatus(403);
  } catch (error) {
    console.error(`Could not delete resort with id ${resortId}`, error);
    res.sendStatus(500);
  }
}

router.get('/', getResorts);
router.get('/:id', getResortById);
router.post('/', authService.authorize, createResort);
router.put('/:id', authService.authorize, updateResort);
router.delete('/:id', authService.authorize, deleteResort);

module.exports = router;
