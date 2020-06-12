const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productsRoutes = require('./routes/products-routes');
const usersRoutes = require('./routes/users-routes');
const AppError = require('./errorHandler');

const app = express();

app.use(bodyParser.json());

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    next(new AppError('Could not find route.', 404));
})
// This error handling middleware will throw an error if a middleware in front of it returns an error
app.use((error, req, res, next) => {
    //This will handle any image from being stored
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occurred!' });
});


mongoose
    .connect(`mongodb+srv://user-ebuy:KAMrbSEWn269ekJp@ebuycluster-yblrk.mongodb.net/ebuyDb?retryWrites=true&w=majority
    `, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => {
        app.listen(5000);
    }).catch(err => {
        console.log(err);
    });

// app.listen(5000 || 5001);

