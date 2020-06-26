const jwt = require('jsonwebtoken');

const AppError = require('../errorHandler');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: Bearer Token
        if (!token) {
            throw new Error('Not authenticated');
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        // dynamically add data to req
        req.userData = { userId: decodedToken.userId }
        next();
    } catch (error) {
        return next(new AppError('Not authenticated', 401));
    }

}