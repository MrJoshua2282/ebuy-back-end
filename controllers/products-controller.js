const mongoose = require('mongoose');
const fs = require('fs');

const Product = require('../models/products-model');
const User = require('../models/users-model');
const AppError = require('../errorHandler');

exports.createProduct = async (req, res, next) => {
    const { title, description, price, company, inventory } = req.body;

    const product = new Product({
        title,
        description,
        price,
        company,
        image: req.file.path,
        inventory,
        creatorId: req.userData.userId
    })


    let theCreatorOfProduct;

    try {
        theCreatorOfProduct = await User.findById(req.userData.userId);
    } catch (error) {
        return next(new AppError('Creating product failed, please try again.', 500));
    }

    if (!theCreatorOfProduct) return next(new AppError('Could not find user for provided id.', 404));

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await product.save({ session: sess });
        theCreatorOfProduct.products.push(product);
        await theCreatorOfProduct.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        return next(new AppError('Creating product failed.  try again.', 500));
    }

    res.status(201).json({
        status: 'success',
        product: product.toObject({ getters: true })
    })
}

exports.getProductById = async (req, res, next) => {
    const prodId = req.params.prodId;
    let product;

    try {
        product = await Product.findById(prodId);
    } catch (error) {
        return next(new AppError('Fetching product failed. Please try again.', 500));
    }

    if (!product) return next(new AppError('No product with that id found', 404));

    res.status(201).json({
        status: 'success',
        product
    })
}

exports.getAllProductsByUser = async (req, res, next) => {
    const userId = req.params.userId;
    let userWithProducts;

    try {
        userWithProducts = await User.findById(userId).populate('products');
        // userWithProducts = await Product.find({ creatorId: userId });
    } catch (error) {
        return next(new AppError('Fetching places failed, please try again later', 500));
    }

    if (!userWithProducts || userWithProducts.products.length === 0) return next(new AppError(`This user doesn't have any products`, 500));
    // if (!userWithProducts || userWithProducts.length === 0) return next(new AppError(`This user doesn't have any products`, 500));

    res.status(201).json({
        status: 'success',
        products: userWithProducts.products.map(product =>
            product.toObject({ getters: true })
        )
    })
}

exports.getAllProducts = async (req, res, next) => {
    let products;
    try {
        products = await Product.find();
    } catch (error) {
        return next(new AppError('Fetching products failed. Please try again', 500));
    }

    if (!products) return next(new AppError('No products found', 404));

    res.status(201).json({
        status: 'success',
        products: products.map(user => user.toObject({ getters: true }))
    })

}

exports.updateProduct = async (req, res, next) => {
    const prodId = req.params.prodId;
    const { title, description, price, company, inventory } = req.body

    let product;
    try {
        product = await Product.findById(prodId);
    } catch (error) {
        return next(new AppError('Fetching products failed. Please try again'), 500);
    }

    if (!product) {
        return next(new AppError('No product with this id exists'), 404);
    }
    // if (product.creatorId.toString() !== userId) 
    if (product.creatorId.toString() !== req.userData.userId) {
        return next(new AppError('You are not allowed to edit this product', 401));
    }
    // console.log(req.file.path, 'updating product!')
    if (req.file) {
        // remove old image
        fs.unlink(product.image, err => {
            console.log(err);
        });
        // add new image
        product.image = req.file.path
    }
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (company) product.company = company;
    if (inventory) product.inventory = inventory;

    // const imagePath = product.image;

    try {
        await product.save();
    } catch (error) {
        return next(new AppError('Failed to successfully update product. Please try again'), 500);
    }

    // fs.unlink(imagePath, err => {
    //     console.log(err, 'ahhhh');
    // });

    res.status(201).json({
        status: 'success',
        product: product.toObject({ getters: true })
    })
}

exports.deleteProduct = async (req, res, next) => {
    const prodId = req.params.prodId;

    let product;
    try {
        product = await Product.findById(prodId).populate('creatorId');
    } catch (error) {
        return next(new AppError('Could not complete deletion. Please try again later', 500));
    }

    if (!product) {
        return next(new AppError('No document found with that ID', 404));
    }

    if (product.creatorId.id !== req.userData.userId) {
        return next(new AppError('You are not allowed to delete product', 401))
    }

    const imagePath = product.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await product.remove({ session: sess });
        product.creatorId.products.pull(product);
        await product.creatorId.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        return next(new AppError('Something went wrong, could not delete product', 500));
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    });


    res.status(204).json({ status: 'successfully deleted product' });
}