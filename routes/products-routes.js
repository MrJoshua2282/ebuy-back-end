const express = require('express');

const productsController = require('../controllers/products-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// router.use(checkAuth)

router
    .route('/')
    .post(checkAuth, fileUpload.single('image'), productsController.createProduct)
    .get(productsController.getAllProducts)

router.get('/user-products/:userId', productsController.getAllProductsByUser)

router.patch('/update-many', productsController.updateMany);

router
    .route('/:prodId')
    .get(productsController.getProductById)
    .patch(checkAuth, fileUpload.single('image'), productsController.updateProduct)
    .delete(checkAuth, productsController.deleteProduct)

module.exports = router;