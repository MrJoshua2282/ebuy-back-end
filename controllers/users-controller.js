const uuid = require('uuid/dist/v4');

const User = require('../models/users-model');
const AppError = require('../errorHandler');

exports.createUser = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    console.log(existingUser)

    if (existingUser) {
        return next(new AppError('Email already exists. Please log in or try another email', 400));
    }

    const createdUser = new User({
        id: uuid,
        firstName,
        lastName,
        email,
        password,
    });

    try {
        await createdUser.save();
    } catch (error) {
        return next(new AppError('Creating user failed, please try again.', 500));
    }

    res.status(201).json({
        status: 'successful',
        user: createdUser
    });
}

exports.updateUser = async (req, res, next) => {
    const userId = req.params.userId;
    const { firstName, lastName, email, password } = req.body;
    let updatedUser;

    try {
        updatedUser = await User.findById(userId)
    } catch (err) {
        return next(new AppError('Fetching places failed. Please try again later', 500));
    }


    if (!updatedUser) {
        return next(new AppError('No user with that id could be found', 404));
    }

    if (firstName) updatedUser.firstName = firstName;
    if (lastName) updatedUser.lastName = lastName;
    if (email) updatedUser.email = email;
    if (password) updatedUser.password = password;

    try {
        await updatedUser.save();
    } catch (error) {
        return next(new AppError(`Wasn't able to update. Please try again later`, 500));
    }
    res.status(200).json({ updatedUser: updatedUser.toObject({ getters: true }) });

}

exports.getUserById = async (req, res, next) => {
    const userId = req.params.userId;
    const user = DUMMY_USER.find
    console.log(user);
    res.status(200).json({
        user
    })
}

exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;
    if (!userId) {
        return next(new AppError('No user with that id found', 404));
    }

    await userId.findById
}
