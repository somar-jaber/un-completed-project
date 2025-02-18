// 401 Unauthorized  (in Invalid token case)
// 403 Forbidden  (they have a toke nbut thier role doesn't allow them to get a specific resource)

module.exports = function (roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return res.status(403).send("403 Forbidden: Access denied: "); 
        next();
    }
}