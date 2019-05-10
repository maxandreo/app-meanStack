const express = require('express');
const multer = require('multer'); // Pour parse un upload

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");

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


// Create a new post en POST, Pour User connecté
router.post(
  "",
  checkAuth,
  multer({storage: storage}).single("image"),
  (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
      // ça vient du Schema MongoDB crée dans backend/models/post.js
      title: req.body.title,
      content: req.body.content,
      // store the image path
      imagePath: req.file ? (url + "/images/" + req.file.filename) : '',
      creator: req.userData.userId
    });
    // requête INSERT de post, nouvel enregistrement (ou 'Document')
    // de post crée plus haut
    post.save()
      .then(createdPost => {
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
      })
      .catch(error => {
        res.status(500).json({
          message: "La création du post a échouée"
        });
      });
  });

//PUT : remplacer un post en un nouveau post
//PATCH : update un post

// Update un Post en PUT, Pour User connecté
router.put(
  "/:id",
  checkAuth,
  multer({storage: storage}).single("image"),
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
      imagePath: imagePath,
      creator: req.userData.userId
    });
    // console.log(post);
    Post.updateOne({
      _id: req.params.id,
      creator: req.userData.userId
    }, post)
      .then(result => {
        // console.log(result);
        if (result.nModified > 0) {
          res.status(200).json({message: "Update successfull!"});
        } else {
          res.status(401).json({message: "Not authorized!"});
        }
      })
      .catch(error => {
        res.status(500).json({
          message: "Mise à jour du post impossible"
        });
      });
  });

// Fetch une liste de Posts en GET
router.get("", (req, res, next) => {
  // console.log(req.query);
  // Pagination
  const pageSize = +req.query.pagesize; // convertir la string en number avec +
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
    // on récupère le first n post
      .skip(pageSize * (currentPage - 1))
      // nombre de documents à récupérer
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      // Retourner le nombre de posts
      return Post.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "La récupération des posts a échouée"
      })
    });
});

// Fetch un post en particulier
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post not found!'});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "La récupération des posts a échouée"
      })
    });
});

// Delete un Post en DELETE, Pour User connecté
router.delete("/:id",
  checkAuth,
  (req, res, next) => {
    Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    })
      .then(result => {
        console.log(result);
        if (result.n > 0) {
          res.status(200).json({message: "Deletion successfull!"});
        } else {
          res.status(401).json({message: "Not authorized!"});
        }
      })
      .catch(error => {
        res.status(500).json({
          message: "La récupération des posts a échouée"
        })
      });
  });

module.exports = router;
