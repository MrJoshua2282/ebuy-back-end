const express = require('express');
const router = express.Router();

const productsController = require('../controllers/products-controller');

router
    .route('/')
    .post(productsController.createProduct)
    .get(productsController.getAllProducts)

router.get('/user-products/:userId', productsController.getAllProductsByUser)

router
    .route('/:prodId')
    .get(productsController.getProductById)
    .patch(productsController.updateProduct)
    .delete(productsController.deleteProduct)



module.exports = router;