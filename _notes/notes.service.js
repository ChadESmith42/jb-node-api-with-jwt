const { dbContext} = require('../utilities');

const getNotes = async () => {
  try {
    const notes = dbContext.query(`
      SELECT * FROM notes WHERE date BETWEEN Now() - 30 AND Now();
    `);
    if (notes) return notes.rows;
  } catch (error) {
    console.error('Could not get notes.', error);
    return error;
  }
}

const getNoteById = async id => {
  try {
    const note = await dbContext.query(`
      SELECT * FROM notes WHERE id = $1;
    `, [id]);
    if (note) return note.rows[0];
  } catch (error) {
    console.error(`Could not get note ${id}.`, error);
    return error;
  }
}

const getNoteByPetId = async (petId, ownerId) => {
  try {
    const notes = await dbContext.query(`
      SELECT notes.id, notes.users_id, notes.pets_id, notes.note, notes.date
      FROM notes
      JOIN pets_owners ON notes.pets_id = pets_owners = pets_id
      WHERE pets_id = $1 AND pets_owners.users_id = $2;
    `, [petId, ownerId]);
    if (notes) return notes.rows;
  } catch (error) {
    console.error(`Could not get notes for pet ${petId}.`, error);
    return error;
  }
}

const getNotesByOwnerId = async ownerId => {
  try {
    const notes = await dbContext.query(`
      SELECT notes.id, users_id, pets_id, note, date
      FROM notes
      JOIN pets_owners ON notes.users_id = pets_owners.users_id
      WHERE pets_owners.users_id = $1;
    `, [ownerId]);
    if (notes) return notes.rows;
  } catch (error) {
    console.error(`Coud not get notes for owner ${ownerId}.`, error);
    return error;
  }
}

const getNotesByEmployee = async employeeId => {
  try {
    const notes = await dbContext.query(`
      SELECT * FROM notes WHERE users_id = $1;
    `, [employeeId]);
    if (notes) return notes.rows;
  } catch (error) {
    console.error(`Could not get notes for employee ${employeeId}.`, error);
    return error;
  }
}

const createNote = async note => {
  try {
    const newNote = await dbContext.query(`
      INSERT INTO notes (users_id, pets_id, note, date)
      VALUES ($1, $2, $3, $4);
    `, [note.users_id, note.pets_id, note.note, note.date]);
    if (newNote) return newNote.rows[0];
    return null;
  } catch (error) {
    console.error('Could not create new note.', error);
    return error;
  }
}

const updateNote = async (noteText, noteId) => {
  try {
    const note = await dbContext.query(`
      UPDATE notes SET note =$1
      WHERE id = $2;
    `, [noteText, noteId]);
    if (note) return note[0];
    return null;
  } catch (error) {
    console.error(`Could not update note ${noteId}.`, error);
    return error;
  }
}

const deleteNote = async (noteId) => {
  try {
    const response = await dbContext.query(`
      DELETE notes WHERE id = $1;
    `, [noteId]);
    if (response) return response.rowCount;
    return null;
  } catch (error) {
    console.error(`Could not delete note ${noteId}.`, error);
    return error;
  }
}

module.exports = { getNotes, getNoteById, getNoteByPetId, getNotesByEmployee, getNotesByOwnerId, createNote, updateNote, deleteNote };
