const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const Post = require("./models/post");

const app = express();

mongoose.connect("mongodb+srv://max:cd6u4oybIOLW35dT@cluster0-jubhq.mongodb.net/node-angular?retryWrites=true", { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log()
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Fetch un Post reçue en POST
app.post("/api/posts", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  // requête INSERT de post, nouvel enregistrement: 'Document'
  post.save();
  res.status(201).json({
    message: 'Post added successfully'
  });
});

// Fetch une liste de Posts en GET
app.get("/api/posts", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: documents
    });
  });
});


// Delete un Post en DELETE
app.delete("/api/posts/:id", (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!"});
  });

});

module.exports = app;
