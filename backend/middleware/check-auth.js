const jwt = require("jsonwebtoken");


// middleware pr vérif si un token est attaché à la requête
// et si le token est valide
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {email: decodedToken.email, userId: decodedToken.userId};
    next();
  } catch (error) {
    res.status(404).json({ message: "Vous n'êtes pas authentifié" });
  }
};
