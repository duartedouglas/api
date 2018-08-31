const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
module.exports = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: "No token provided" });
    }

    const parts = authorization.split(" ");
    if (!parts.lenght === 2) {
        return res.status(401).send({ error: "token error" });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ error: "token malformated" });
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: "token invalid" });
        }
        req.userId = decoded.id;
        return next();
    });
};