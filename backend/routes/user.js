const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

// Créer un User
router.post("/signup", (req, res, next) => {
  // Crypter mdp
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Créer a new User
      const user = new User({
        email: req.body.email,
        password: hash
      });
      // INSERT User dans la DB
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created!',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    });
});

// Connecter un User
router.post("/login", (req, res, next) => {
  let fetchedUser;
  // Vérifier qu'un user existe en vérifiant que l'email existe
  User.findOne({email: req.body.email})
    .then(user => {
      // console.log(user);
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      // console.log(result);
      if (!result) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      // Ici Valid password, Créer le JSON Web Token
      const token = jwt.sign(
        {email: fetchedUser.email, userId: fetchedUser._id},
        'secret_this_should_be_longer',
        {expiresIn: "1h"}
      );
      // console.log(token);
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      // console.log(err);
      return res.status(401).json({
        message: 'Auth failed'
      });
    });
});

module.exports = router;
