const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            isAdmin: decoded.isAdmin
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

const adminAuthMiddleware = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    next();
};

module.exports = { authMiddleware, adminAuthMiddleware };