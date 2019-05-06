const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

mongoose.connect("mongodb+srv://max:cd6u4oybIOLW35dT@cluster0-jubhq.mongodb.net/node-angular?retryWrites=true", { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Failed to connect database');
  });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// rendre le dossier images accessible de manière statique
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);


module.exports = app;
