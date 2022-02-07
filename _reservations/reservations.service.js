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
    const hasCapacity = await this.hasCapacity(reservation.date, reservation.resortId);
    if (hasCapacity) {
      const newReservation = await pg.query(`
        INSERT INTO reservations (pets_id, owners_id, resorts_id, date)
        VALUES ($1, $2, $3, $4);
      `, [reservation.pets_id, reservation.owners_id, reservation.resorts_id, reservation.date]);
      if (newReservation) {
        return newReservation.rows[0];
      }
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

/**
 * Get the number of existing reservations for a given date and resort.
 * @param {date} reservationDate
 * @param {int} reservationId
 * @returns {int} Count of existing reservations.
 */
const getExistingReservationCount = async (reservationDate, reservationId) => {
  try {
    const reservationCount = await pg.query(
      `
      SELECT Count(*)
      FROM reservations
      WHERE resorts_id = $1 and date = $2;
      `,
      [reservationId, reservationDate]
    );
    return reservationCount.rowCount;
  } catch (error) {
    console.error('Could not get count of reservations.', error);
    return null;
  }
}

/**
 * Gets the capacity for a given resort on a specific day of the week.
 * @param {string} weekday
 * @param {int} resortId
 * @returns {int} Number of reservations possible for that day and resort.
 */
const getLimit = async (weekday, resortId) => {
  const limit = await pg.query(`
    SELECT resorts_hours.capacity
    FROM resorts_hours
    WHERE resorts_id = $1 AND day = $2;
  `, [resortId, weekday]);
  return limit.rows[0];
}

/**
 * Determines if resort has capacity for a reservation on the date.
 * @param {date} reservationDate
 * @param {int} resortId
 * @returns {boolean} True if a reservation can be made.
 */
const hasCapacity =  async (reservationDate, resortId) => {
  const weekday = new Date(reservationDate).getDay();
  const reservationDay = convertDay(weekday);
  const capacity = await getLimit(reservationDay, resortId);
  const booked = await getExistingReservationCount(reservationDate, resortId);
  return booked > capacity;
}

/**
 * Converts the integer Date.getDay() value into the string Weekday value.
 * @param {int} weekday
 * @returns {string} Name of the day of week.
 */
const convertDay = weekday => {
  let day = '';
  switch (weekday) {
    case 0:
      day = 'Sunday';
      break;
    case 1:
      day = 'Monday';
      break;
    case 2:
      day = 'Tuesday';
      break;
    case 3:
      day = 'Wednesday';
      break;
    case 4: 'Thursday';
      break;
    case 5: 'Friday';
      break;
    case 6: 'Saturday';
      break;
  }
  return day;
}

module.exports = { getReservations, getUserReservations, getResortReservations, createReservation, deleteReservation, getExistingReservationCount, hasCapacity };
