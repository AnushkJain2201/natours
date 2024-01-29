const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser } = userController;
const { signup, login } = authController;


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;