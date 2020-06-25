const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Product = require('../models/products-model');
const User = require('../models/users-model');
const AppError = require('../errorHandler');

exports.signup = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (error) {
        return next(new AppError('Signing up failed, please try again ', 500));
    }

    if (existingUser) {
        return next(new AppError('User already exists, please login instead', 422));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(new AppError('Could not create user, please try again', 500));
    }

    const createdUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        products: []
    });

    try {
        await createdUser.save();
    } catch (error) {
        return next(new AppError('Creating user failed, please try again.', 500));
    }

    let token;
    // put whatever information you need in the token for the front end
    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, 'keep_quite_string', { expiresIn: '1h' })
    } catch (error) {
        return next(new AppError('Creating user failed, please try again.', 500));
    }

    res.status(201).json({
        status: 'success',
        userId: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        token: token
        // user: createdUser.toObject({ getters: true })
    });
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (error) {
        return next(new AppError('Logging in failed. Please try again ', 500));
    }
    // if (!existingUser || existingUser.password !== password) 
    if (!existingUser) return next(new AppError('Incorrect credentials, could not log you in', 401));

    let isValidPassword;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (error) {
        return next(new AppError('Could not log you in, please check your credentials and try again.', 500))
    }

    if (!isValidPassword) {
        return next(new AppError('Incorrect credentials, could not log you in', 401));
    }

    let token;
    // put whatever information you need in the token for the front end
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'keep_quite_string', { expiresIn: '1h' })
    } catch (error) {
        return next(new AppError('Logging in failed, please try again.', 500));
    }

    res.status(201).json({
        message: 'logged in!',
        userId: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        token: token
        // user: existingUser.toObject({ getters: true })
    })
}

exports.getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
        // users = await User.find();
    } catch (error) {
        return next(new AppError('Fetching users failed. Please try again.', 500));
    }

    if (!users) return next(new AppError('No users found', 404));

    res.status(201).json({
        status: 'success',
        users: users.map(user => user.toObject({ getters: true }))
    })
}

exports.updateUser = async (req, res, next) => {
    const userId = req.params.userId;
    const { firstName, lastName, email, password, newPassword } = req.body;
    let updatedUser;
    if (!email || !password) {
        return next(new AppError('Incorrect credentials', 401));
    }

    try {
        updatedUser = await User.find({ email: email });
    } catch (err) {
        return next(new AppError('Fetching user failed. Please try again later', 500));
    }

    if (!updatedUser) {
        return next(new AppError('No user with that id could be found', 404));
    }

    if (product.creatorId.toString() !== req.userData.userId) {
        return next(new AppError('You are not allowed to edit this product', 401));
    }

    if (updatedUser[0].password !== password) {
        // console.log(updatedUser[0].firstName);
        return next(new AppError(`Incorrect credentials`, 401));
    }

    if (firstName) updatedUser[0].firstName = firstName;
    if (lastName) updatedUser[0].lastName = lastName;
    // if (email) updatedUser.email = email;
    if (newPassword) updatedUser[0].password = newPassword;
    console.log(updatedUser[0].lastName)

    try {
        await updatedUser[0].save();
    } catch (error) {
        return next(new AppError(`Wasn't able to update, please try again later`, 500));
    }
    res.status(200).json({ user: updatedUser.toObject({ getters: true }) });

}

exports.getUserById = async (req, res, next) => {
    const userId = req.params.userId;
    let user;
    try {
        user = await User.findById({ userId }, '-password');
    } catch (error) {
        return next(new AppError('No user with this id exists', 404));
    }

    res.status(200).json({
        status: 'success',
        user
    })
}

exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;
    const { email, password } = req.body;
    let user;
    let products;

    try {
        // user = await User.findByIdAndDelete(userId);
        // user = await User.findById(userId);
        user = await User.findById(req.userData.userId);
    } catch (error) {
        return next(new AppError('Could not complete deletion, please try again later', 500));
    }

    if (!user || user.email !== email || user.password !== password) return next(new AppError('Incorrect credentials, please try again', 401))

    // There are no images being used for users
    // const imagePath = user.image;

    try {
        // products = await Product.deleteMany({ creatorId: userId });
        // user = await User.findByIdAndDelete(userId);
        products = await Product.deleteMany({ creatorId: req.userData.userId });
        user = await User.findByIdAndDelete(req.userData.userId);
    } catch (err) {
        return next(new AppError('Could not complete deletion, please try again later', 500));
    }

    // fs.unlink(imagePath, err => {
    //     console.log(err);
    //   });

    res.status(204).json({
        status: 'successfully deleted user'
    })
}
