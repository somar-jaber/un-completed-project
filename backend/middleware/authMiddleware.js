// Authorization middleware
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function auth(req, res, next) {
    // Cheking if there is a token in the request
    const token = req.header("x-auth-token");
    if (!token)  return res.status(401).send("401 Access denied: No token provided")
    try {
        // decoding the payload using the jwt private key that we store in our environment variable
        const decodedPayload = jwt.verify(token, config.get("jwtPrivateKey"));
        // puttin the decoded payload to the request
        req.user = decodedPayload;
        next();
    } catch (ex) {
        return res.status(400).send("400 Bad Request: Invalid token");
    }
}

