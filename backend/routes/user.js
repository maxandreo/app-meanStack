const express = require('express');

const UserController = require("../controllers/user");

const router = express.Router();

// Créer un User
router.post("/signup", UserController.createUser);

// Connecter un User
router.post("/login", UserController.userLogin);

module.exports = router;
