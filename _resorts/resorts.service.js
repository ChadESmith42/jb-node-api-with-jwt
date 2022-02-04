const res = require('express/lib/response');
const pg = require('../utilities.db.context');
const authService = require('../utilities/authorize');

/**
 * Gets list of all resorts.
 * @returns {array} Resorts objects
 */
const getResorts = async () => {
  try {
    const resorts = await pg.query(`SELECT * FROM resorts;`);
    return resorts.rows;
  } catch (error) {
    console.log('Could not retrieve resorts.', error);
    return null;
  }
}

const getResortsById = async id => {
  try {
    const resort = await pg.query(`SELECT * FROM resorts WHERE id = $1`, [id]);
    return resort.rows[0];
  } catch (error) {
    console.log(`Could not retrieve resort with id of ${id}.`, error);
    return null;
  }
}

const createResort = async resort => {
  try {
    const newResort = pg.query(`
      INSERT INTO resorts (name, address, city, state, "zipCode", latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [resort.name, resort.address, resort.city, resort.state, resort.zipCode, resort.latitude, resort.longitude]);
    return newResort.rows[0]
  } catch (error) {
    console.log('Could not create new resort.', error);
    return null;
  }
}

const updateResort = async (resort, resortId) => {
  try {
    const updatedResort = pg.query(`
      UPDATE resorts
      SET name = $1, address = $2, city = $3, state = $4, "zipCode" = $5, latitude = $6, longitude = $7
      WHERE resorts.id = $8
      RETURNING *;
    `, [resort.name, resort.address, resort.city, resort.state, resort.zipCode, resort.latitude, resort.longitude, resortId]);
    return updatedResort.rows[0];
  } catch (error) {
    console.log(`Could not update resort with id ${resortId}.`, error);
    return null;
  }
}

const deleteResort = async resortId => {
  try {
    const resort = pg.query(`
      DELETE FROM resorts WHERE id = $1;
    `, );
    return resort.rowCount;
  } catch (error) {
    console.log(`Could not delete resort with id ${resortId}.`, error);
    return null;
  }
}

module.exports = { getResorts, getResortsById, createResort, updateResort, deleteResort };
