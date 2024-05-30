const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe } = userController;
const { signup, login, forgotPassword, resetPassword, protect, updatePassword, logout } = authController;


const router = express.Router();

router.get('/me', protect, getMe, getUser);

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// What this will do is protect every route that come after this
router.use(protect);

router.patch('/updateMyPassword', updatePassword);

router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// After this, every route only accessible to admin
router.use(authController.restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;