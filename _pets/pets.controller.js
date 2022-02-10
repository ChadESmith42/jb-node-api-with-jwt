const express = require('express');
const router = express.Router();
const petService = require('./pets.service');
const { authService } = require('../utilities');


const getPets = async (req, res) => {
  const authUser = req.user;
  try {
    const pets = await petService.getPets(authUser);
    res.send(pets);
  } catch (error) {
    console.error(`Could not get list of all pets for ${user}.`, error);
    res.sendStatus(500).json({ message: 'Cannot get list of pets at this time.'}) ;
  }
}

const getPetById = async (req, res, next) => {
  const authUser = req.user;
  const petId = req.params.id;
  const pet = await petService.getPetById(petId, authUser);
  if (pet) {
    res.status(200).json(pet);
  }
  res.status(404).json({ message: 'The pet you requested does not exist.' });
}

const createPet = async (req, res) => {
  const newPet = req.body;
  const userId = req.user.sub;
  try {
    const pet = await petService.createPet(newPet, userId);
    res.send(pet);
  } catch (error) {
    console.error(`Could not create ${pet} for ${user}.`, error);
    res.sendStatus(500).json({ message: 'Could not create a new pet at this time.'});
  }
}

const updatePet = async (req, res) => {
  const user = req.user;
  const pet = req.body;
  const petId = req.params.id;
  try {
   if (pet.id !== Number(petId) || pet.ownerId !== user.sub) {
     console.log(`Pet id in param ${petId} and pet.id in body ${pet.id}`);
     console.log(`authUser ${user.sub} ownerId ${pet.ownerId}`);
     res.sendStatus(403);
   }
   const updatedPet = await petService.updatePet(pet);
   res.send(updatedPet);
  } catch (error) {
    console.error('Error updating pet', { pet }, error);
    res.sendStatus(500);
  }
}

const deletePet = async (req, res) => {
  const petId = req.params.id;
  const user = req.user;
  try {
  const response = await petService.deletePet(petId, user);
  if (response) {
    res.sendStatus(204);
  }
  } catch (error) {
    console.error('Could not delete pet', error);
    res.status(500).json({ message: 'Could not delete pet at this time.' });
  }


}

router.get('/', authService.authorize, getPets);
router.get('/:id', authService.authorize, getPetById);
router.post('/', authService.authorize, createPet);
router.put(`/:id`, authService.authorize, updatePet);
router.delete(`/:id`, authService.authorize, deletePet);

module.exports = router;
