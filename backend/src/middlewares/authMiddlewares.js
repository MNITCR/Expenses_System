const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) {
        return res.status(401).json({message: "No token, authorization denied"});
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET ,(err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Expired token' });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(400).json({message: "Token is invalid"});
    }
};

module.exports = verifyToken;
