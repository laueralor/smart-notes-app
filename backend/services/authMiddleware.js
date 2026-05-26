const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'There is not token, denegated' });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'TEMPORAL_SECRET');
        req.user = decoded.userId; 
        next(); 
    } catch (error) {
        res.status(401).json({ message: 'Token not valid' });
    }
};