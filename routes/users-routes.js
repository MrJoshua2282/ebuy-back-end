const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users-controller');

router.route('/').post(usersController.createUser)

router
    .route('/:userId')
    .get(usersController.getUserById)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)


module.exports = router;