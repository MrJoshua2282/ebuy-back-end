const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users-controller');

router.route('/')
    .get(usersController.getAllUsers)

router.route('/signup')
    .post(usersController.signup)

router.route('/login')
    .post(usersController.login)

router.route('/update-user')
    .patch(usersController.updateUser)

router
    .route('/:userId')
    .get(usersController.getUserById)

router
    .route('/delete-user/:userId')
    .delete(usersController.deleteUser)

module.exports = router;