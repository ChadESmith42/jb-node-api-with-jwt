const express = require('express');
const router = express.Router();
const reservationService = require('./reservations.service');
const authService = require('../utilities/authorize');

const getReservations = async (req, res) => {
  try {
    const reservations = await reservationService.getReservations();
    if (reservations) res.send(reservations);
  } catch (error) {
    console.log('Could not get reservations.', error);
    res.sendStatus(500);
  }
}

const getUserReservations = async (req, res) => {
  try {
    const authUser = req.user;
    const userId = req.query.userId;
    // If user is checking someone else's reservations, reject with 403.
    if (authUser.id !== userId) res.sendStatus(403);

    const reservations = await reservationService.getUserReservations(userId);
    if (reservations) res.send(reservations);
  } catch (error) {
    console.error(`Could not get reservations for user ${userId}.`, error);
    res.sendStatus(500);
  }
}

const getResortReservations = async (req, res) => {
  const startDate = req.query.start;
  const endDate = req.query.end;
  const resortId = req.params.id;
  try {
    const reservations = await reservationService.getResortReservations(resortId, startDate, endDate);
    if (reservations) res.send(reservations);
    res.sendStatus(404);
  } catch (error) {
    console.error(`Could not get reservations for resort ${resortId} between ${startDate} and ${endDate}.`, error);
    res.sendStatus(500);
  }
}

const createReservation = async (req, res) => {
  const reservation = req.body;
  try {
    const newReservation = await reservationService.createReservation(reservation);
    if (newReservation) res.send(newReservation);
  } catch (error) {
    console.error(`Could not create new reservation.`, error);
    res.sendStatus(500);
  }
}

const deleteReservation = async (req, res) => {
  const reservationId = req.params.id;
  try {
    const result = await reservationService.deleteReservation(reservationId);
    if (result) res.sendStatus()
  } catch (error) {
    console.log(`Could not delete reservation ${reservationId}.`, error);
    res.sendStatus(500);
  }
}

const getAvailability = async (req, res) => {
  try {
    const reservation = req.body;
    const isAvailable = await reservationService.checkCapacity(reservation);
    res.send(isAvailable);
  } catch (error) {
    console.error('Could not get availability.', error);
    res.send(500);
  }

}

router.get('/reservations', authService.superUserOnly, getReservations);
router.get('/reservations/user', authService.authorize, getUserReservations);
router.get('/reservations/:id', authService.superUserOnly, getResortReservations);
router.post('/reservations', authService.authorize, createReservation);
router.delete('/reservation/:id', authService.userOrAdmin, deleteReservation);

module.exports = router;
