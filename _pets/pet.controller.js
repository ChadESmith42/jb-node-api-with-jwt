const express = require('express');
const router = express.Router();
const petService = require('./pet.service');
const authorize = require('../utilities/authorize');
const Role = require('../utilities/role');

const getPets = async (req, res) => {
  const authUser = req.user;
  const pets = await petService.getPets(authUser);
  if (pets) {
    res.status(200).json(pets);
  }
  res.status(401).json({ message: 'Unauthorized' });
}

const getPetById = async (req, res, next) => {
  const authUser = req.user;
  const petId = req.params.id;
  const pet = await petService.getPetById(petId, authUser);
  if (pet) {
    res.status(200).json(pet);
  }
  res.status(400).json({ message: 'Either the pet you requested does not exist or you are not authorized to view this pet.' });
}

const createPet = async (req, res) => {
  const newPet = req.body;
  const userId = req.user.id;
  const pet = await petService.createPet(newPet, userId);
  if (pet) {
    res.status(204).json(pet);
  }
  res.status(500).json({ message: 'Could not create a pet at this time.' });
}

const updatePet = async (req, res) => {
  const user = req.user;
  const pet = req.body;
  const petId = req.params.id;
  if (pet.id != petId) {
    res.status(403).json({ message: 'Forbidden' });
  }
  const updatedPet = await petService.updatePet(pet, user);
  if (updatedPet) {
    res.status(200).json(updatedPet);
  }
  res.status(500).json({ message: 'Could not update pet at this time.' });
}

const deletePet = async (req, res) => {
  const petId = req.params.id;
  const user = req.user;

  const response = await petService.deletePet(petId, user);
  if (response) {
    res.status(200);
  }
  res.status(500).json({ message: 'Could not delete pet at this time.' });
}

router.get('/pets', Authorize(), getPets);
router.get('/pets/:id', Authorize(), getPetById);
router.post('/pets', Authorize(), createPet);
route.put(`/pets/:id`, Authorize(), updatePet);
route.delete(`/pets/:id`, Authorize(), deletePet);

module.exports = router;
