const express = require('express');
const router = express.Router();
const notesService = require('./notes.service');
const { authorize } = require('../utilities');

const getNotes = async (req, res) => {
  try {
    const notes = await notesService.getNotes();
    if (notes) res.send(notes);
    res.sendStatus(404);
  } catch (error) {
    console.error('Could not get notes.', error);
    res.sendStatus(500);
  }
}

const getNoteById = async (req, res) => {
  const noteId = req.params.id;
  try {
    const note = await notesService.getNoteById(noteId);
    if (note) res.send(note);
    res.sendStatus(404);
  } catch (error) {
    console.error(`Could not get note ${noteId}.`, error);
    res.sendStatus(500);
  }
}

const getNotesByPetId = async (req, res) => {
  const petId = req.params.id;
  const ownerId = req.query.ownerId;
  try {
    const notes = await notesService.getNoteByPetId(petId, ownerId);
    if (notes) res.send(notes);
    res.sendStatus(404);
  } catch (error) {
    console.error(`Could not get note for pet ${petId} and owner ${ownerId}`, error);
    res.sendStatus(500);
  }
}

const getNotesByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  try {
    const notes = await notesService.getNotesByOwnerId(ownerId);
    if (notes) res.send(notes);
    res.sendStatus(404);
  } catch (error) {
    console.error(`Could not get notes for owner ${ownerId}.`, error);
    res.sendStatus(500);
  }
}

const getNotesByEmployeeId = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const notes = await notesService.getNotesByEmployee(employeeId);
    if (notes) res.send(notes);
    res.sendStatus(404);
  } catch (error) {
    console.log(`Could not get notes for employee ${employeeId}.`, error);
    res.sendStatus(500);
  }
}

const createNote = async (req, res) => {
  const note = req.body;
  try {
    const note = await notesService.createNote(note);
    if (note) res.send(note);
    res.sendStatus(400);
  } catch (error) {
    console.log('Could not create new note.', error);
    res.sendStatus(500);
  }
}

const updateNote = async (req, res) => {
  const noteText = req.body;
  const noteId = req.params.id;
  try {
    const note = await notesService.updateNote(noteText, noteId);
    if (note) res.send(note);
    res.sendStatus(400);
  } catch (error) {
    console.log('Could not update note.', error);
    res.sendStatus(500);
  }
}

const deleteNote = async (req, res) => {
  const noteId = req.params.id;
  try {
    const response = await notesService.deleteNote(noteId);
    if (response) res.send(response);
  } catch (error) {
    console.error(`Could not delete note ${noteId}.`, error);
    res.sendStatus(500);
  }
}

router.get('/notes', authorize.superUserOnly, getNotes);
router.get('/notes/:id', authorize.authorize, getNoteById);
router.get('/notes/byPet/:id', authorize.authorize, getNotesByPetId);
router.get(`/notes/byOwner/:id`, authorize.authorize, getNotesByOwnerId);
router.get('/notes/byEmployee/:id', authorize.superUserOnly, getNotesByEmployeeId);
router.post('/notes', authorize.superUserOnly, createNote);
router.put('/notes/:id', authorize.superUserOnly, updateNote);
router.delete('/notes/:id', authorize.superUserOnly, deleteNote);

module.exports = router;
