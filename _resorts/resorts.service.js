const pg = require('../utilities/db.context');


/**
 * Gets list of all resorts.
 * @returns {array} Resorts objects
 */
const getResorts = async () => {
  try {
    const resorts = await pg.query(`SELECT * FROM resorts;`);
    return resorts.rows;
  } catch (error) {
    console.error('Could not retrieve resorts.', error);
    return null;
  }
}

/**
 * Get a resort by Id.
 * @param {int} id
 * @returns {object} Resort object
 */
const getResortsById = async id => {
  try {
    const resort = await pg.query(`SELECT * FROM resorts WHERE id = $1`, [id]);
    return resort.rows[0];
  } catch (error) {
    console.error(`Could not retrieve resort with id of ${id}.`, error);
    return null;
  }
}

/**
 * Create a new resort record.
 * @param {object} resort
 * @returns {object} New resort object from db.
 */
const createResort = async resort => {
  try {
    const newResort = pg.query(`
      INSERT INTO resorts (name, address, city, state, "zipCode", latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `, [resort.name, resort.address, resort.city, resort.state, resort.zipCode, resort.latitude, resort.longitude]);
    return newResort.rows[0]
  } catch (error) {
    console.error('Could not create new resort.', error);
    return null;
  }
}

/**
 * Update a resort object.
 * @param {object} resort
 * @param {int} resortId
 * @returns {object} Resort object from db.
 */
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
    console.error(`Could not update resort with id ${resortId}.`, error);
    return null;
  }
}

/**
 * Delete a resort object
 * @param {int} resortId
 * @returns {int} Row count of affected records.
 */
const deleteResort = async resortId => {
  try {
    const resort = pg.query(`
      DELETE FROM resorts WHERE id = $1;
    `, );
    return resort.rowCount;
  } catch (error) {
    console.error(`Could not delete resort with id ${resortId}.`, error);
    return null;
  }
}

module.exports = { getResorts, getResortsById, createResort, updateResort, deleteResort };
