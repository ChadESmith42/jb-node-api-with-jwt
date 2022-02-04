const pg = require('../utilities/db.context');
const dateFilters = require('../utilities/date-filter');

const getUserReservations = async (userId) => {
  try {
    const reservations = await pg.query(`
      SELECT *
      FROM reservations
      WHERE owners_id = $1
      ORDER BY date DESC;
    `, [userId]);
    if (reservations) {
      return reservations.rows;
    }
    return null;
  } catch (error) {
    console.error(`Could not retrieve reservations for user ${userId}.`, error);
    return null;
  }
}

const getReservations = async () => {
  try {
    const reservations = await pg.query( `
      SELECT *
      FROM reservations
      WHERE date >= Now() - 30;
      ORDER BY date DESC, resorts_id
    `);
    if (reservations) {
      return reservations.rows;
    }
    return null;
  } catch (error) {
    console.error(`Could not get current reservations`, error);
    return null;
  }
}

/**
 *
 * @param {int} resortId
 * @param {string} startDate
 * @param {string} endDate
 * @returns
 */
const getResortReservations = async (resortId, startDate, endDate) => {
  try {
    const reservations = await pg.query(`
      SELECT *
      FROM reservations
      WHERE id = $1 AND (${dateFilters.startDateToEndDate(startDate, endDate)});
    `);
    if (reservations) {
      return reservations.rows;
    }
    return null;
  } catch (error) {
    console.error(`Could not get reservations for ${resortId} between ${startDate} and ${endDate}.`, error);
    return null;
  }
}

const createReservation = async  reservation => {
  try {
    const newReservation = await pg.query(`
      INSERT INTO reservations (pets_id, owners_id, resorts_id, date)
      VALUES ($1, $2, $3, $4);
    `, [reservation.pets_id, reservation.owners_id, reservation.resorts_id, reservation.date]);
    if (newReservation) {
      return newReservation.rows[0];
    }
    return null;
  } catch (error) {
    console.error(`Could not create new reservation.`, error);
    return null;
  }
}

const deleteReservation = async reservationId => {
  try {
    const results = await pg.query(`
    DELETE reservations
    WHERE id = $1;
    `, [reservationId]);
    if (results) return results;
    return null;
  } catch (error) {
    console.error(`Could not delete reservation with id ${reservationId}.`, error);
    return null;
  }
}

module.exports = { getReservations, getUserReservations, getResortReservations, createReservation, deleteReservation };
