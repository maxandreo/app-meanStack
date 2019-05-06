const express = require('express');
const multer = require('multer'); // Pour parse un upload

const Post = require("../models/post");

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // valider the incoming files
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    // destination de l'upload
    callback(error, "backend/images");
  },
  filename: (rq, file, callback) => {
    // name file comme mon-image-background
    const name = file.originalname.toLowerCase().split(' ').join('-');
    // obtenir le .jpg .png
    const ext = MIME_TYPE_MAP[file.mimetype];
    // passer ces infos à multer
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});


// Fetch un Post reçue en POST
router.post("", multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    // ça vient du Schema MongoDB crée dans backend/models/post.js
    title: req.body.title,
    content: req.body.content,
    // store the image path
    imagePath: url + "/images/" + req.file.filename
  });
  // requête INSERT de post, nouvel enregistrement (ou 'Document')
  // de post crée plus haut
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully',
      // postId: createdPost._id
      post: {
        // id: createdPost._id,
        // title: createdPost.title,
        // content: createdPost.content,
        // imagePath: createdPost.imagePath
        ...createdPost,
        id: createdPost._id
      }
    });
  });
});

//PUT : remplacer un post en un nouveau post
//PATCH : update un post

// Update un Post en PUT
router.put(
  "/:id", multer({storage: storage}).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + '://' + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath
    });
    // console.log(post);
    Post.updateOne({_id: req.params.id}, post).then(result => {
      // console.log(result);
      res.status(200).json({message: "Update successfull!"});
    });
  });

// Fetch une liste de Posts en GET
router.get("", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: documents
    });
  });
});

// Fetch un post en particulier
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found!'});
    }
  });
});

// Delete un Post en DELETE
router.delete("/:id", (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
    .then(result => {
      // console.log(result);
      res.status(200).json({message: "Post deleted!"});
    });

});

module.exports = router;
