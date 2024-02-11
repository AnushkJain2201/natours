const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe } = userController;
const { signup, login, forgotPassword, resetPassword, protect, updatePassword } = authController;


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;