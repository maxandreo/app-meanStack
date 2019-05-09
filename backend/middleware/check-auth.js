const jwt = require("jsonwebtoken");


// middleware pr vérif si un token est attaché à la requête
// et si le token est valide
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "secret_this_should_be_longer");
    next();
  } catch (error) {
    res.status(404).json({ message: "Auth failed, pas de token" });
  }
};
