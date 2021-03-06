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
      queryText = `
        SELECT pets.id, name, breed, birthday, weight, height, primary_color as "primaryColor", secondary_color as "secondaryColor",
                        date_registered as "dateRegistered", pets_owners.users_id as "ownerId"
        FROM pets
        JOIN pets_owners ON pets.id = pets_owners.pets_id
        WHERE pets_owners.users_id = $1;
      `;
      queryParams.push(user.sub);
    }
    const pets = await pg.query(queryText, queryParams);
    return pets.rows;
  } catch (error) {
    console.error('Could not retrieve all pets.', error);
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
    console.error(`Could not retrieve pet with id ${id}.`, error);
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
    await pg.query(`BEGIN`);
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
      const newPet = response.rows[0];
      const petOwner = await pg.query(
        `INSERT INTO pets_owners (pets_id, users_id)
        VALUES ($1, $2)
        RETURNING *;
        `,
        [newPet.id, userId]
      );
      await pg.query('COMMIT');
      return { ...newPet, ownerId: petOwner.rows[0].owners_id };
  } catch (error) {
    console.error(`Could not create pet in PetService.`, error);
    await pg.query('ROLLBACK');
    return null;
  }
}


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
    const updatedPet = await pg.query(queryText, queryParams);
    if (updatedPet) {
      return updatedPet.rows[0];
    }
  } catch (error) {
    console.error('Could not update pet.', error);
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
    const response = await pg.query(`
      DELETE FROM pets
      WHERE id = $1;
    `, [ petId ]);
    return response.rowCount === 1;
  } catch (error) {
    console.error('Could not delete pet.', error);
    return false;
  }
};

module.exports = { getPets, getPetById, createPet, updatePet, deletePet };
