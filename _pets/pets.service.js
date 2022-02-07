const pg = require('../utilities/db.context');
const { authService } = require('../utilities');


/**
 * Gets all pets based on user role. Admins and Employees may see all pets. Users may only see their pets.
 * @returns {array} Pets or null.
 */
const getPets = async (user) => {
  let pets = null;
  let queryText = `SELECT * FROM pets ORDER BY name;`;
  const queryParams = [];
  try {
    if (!authService.superUserOnly(user)) {
      queryText =  `
        SELECT *
        FROM pets
        JOIN pets_owners ON pets.id = pets_owners."pet_id"
        WHERE pets_owners."user_id" = $1
      `;
      queryParams.push(user.id);
    }
    const pets = await pg.query(queryText, queryParams);
    return pets.rows;
  } catch (error) {
    console.log('Could not retrieve all pets.', error);
    return null;
  }
};

/**
 * Get a single Pet object by id based on User.role. Admins and Employees may retrieve any pet. Users may only see their own pets.
 * @param {int} id Pet id
 * @param {object} user Authenticated user
 * @returns {object} Pet object
 */
const getPetById = async (id, user) => {
  let pet = null;
  try {
    if (authService.superUserOnly(user)) {
      pet = await pg.query(`SELECT * FROM pets WHERE id = $1;`, [id]);
    } else {
      pet = await pg.query(
        `
        SELECT *
        FROM pets
        JOIN pets_owners ON pets.id = pets_owners.pet_id
        WHERE pets_owners.owner_id = $1 AND pet.id = $2;
      `,
        [user.id, id]
      );
    }
    return pet.rows[0];
  } catch (error) {
    console.log(`Could not retrieve pet with id ${id}.`, error);
    return null;
  }
};

/**
 * Create a new pet and link user.
 * @param {object} pet
 * @param {int} userId
 * @returns {object} Pet object or null
 */
const createPet = async (pet, userId) => {
  try {
    await pg.query('BEGIN'); // Using a Postgresql TRANSACTION for this process
    const response = await pg.query(
      `
      INSERT INTO pets (name, breed, birthday, weight, height, "primary_color", "secondary_color")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
      [
        pet.name,
        pet.breed,
        pet.birthday,
        pet.weight,
        pet.height,
        pet.primaryColor,
        pet.secondaryColor,
      ]
    );
    const createdPet = response.rows[0];
    await pg.query(
      `
      INSERT INTO pets_owners (pet_id, owner_id)
      VALUES ($1, $2)
      RETURNING *;
    `,
      [createdPet.id, userId]
    );
    await pg.query('COMMIT;');
    return createdPet;
  } catch (error) {
    console.log('Could not create new pet', error);
    await pg.query(`ROLLBACK`);
    return null;
  }
};

/**
 * Update a Pet object dependent upon User.role. Admins and Employees may update any pet. Users may only update their own pets.
 * @param {object} pet
 * @param {object} user
 * @returns {object} Pet object or null
 */
const updatePet = async (pet, user) => {
  try {
    let queryText = `
          UPDATE pets
          SET name=$1, breed=$2, birthday=$3, weight=$4, height=$5, "primary_color"=$6, "secondary_color"=$7
          WHERE pets.id = $8
          RETURNING *;`;
    const queryParams = [
      pet.name,
      pet.breed,
      pet.birthday,
      pet.weight,
      pet.height,
      pet.primaryColor,
      pet.secondaryColor,
      pet.id,
    ];
    if (authService.userOnly(user)) {
      queryText = `
          UPDATE pets
          SET name=$1, breed=$2, birthday=$3, weight=$4, height=$5, "primary_color"=$6, "secondary_color"=$7
          WHERE pets.id IN (SELECT pets_id FROM pets_owners WHERE pets_id = $8 AND users_id = $9);
          RETURNING *;`;
      queryParams.push(user.id);
    }
    const updatedPet = await pg.query(queryText, queryParams);
    if (updatedPet) {
      return updatedPet.rows[0];
    }
  } catch (error) {
    console.log('Could not update pet.', error);
    return null;
  }
};

/**
 * Delete a Pet based on User.role. Admins and Employees may delete any pet. Users may only delete their own.
 * @param {int} petId
 * @param {object} user
 * @returns {any} Row count or null
 */
const deletePet = async (petId, user) => {
  try {
    let queryText = `DELETE FROM pets WHERE id = $1;`;
    const queryParams = [petId];

    if (authService.userOnly(user)) {
      queryText = `
        DELETE FROM pets
        WHERE pets.id IN (SELECT pets_id FROM pets_owners WHERE users_id = $2 AND pets_owners.pets_id = $1);
      `;
      queryParams.push(user.id);
    }

    const response = await pg.query(queryText, queryParams);
    if (response) {
      return response.rowCount;
    }
  } catch (error) {
    console.log('Could not delete pet.', error);
    return null;
  }
};

module.exports = { getPets, getPetById, createPet, updatePet, deletePet };
