const authorizeRole = (...allowRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (user && allowRoles.includes(user.role)) {
            next();
        } else {
            res.status(403).json({ message: "Access denied" });
        }
    };
};

module.exports = authorizeRole;
