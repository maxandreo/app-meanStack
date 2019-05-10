const express = require('express');


const PostController = require("../controllers/posts");

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const router = express.Router();


// Create a new post en POST, Pour User connecté
router.post("", checkAuth, extractFile, PostController.createPost);

//PUT : remplacer un post en un nouveau post
//PATCH : update un post

// Update un Post en PUT, Pour User connecté
router.put("/:id", checkAuth, extractFile, PostController.updatePost );

// Fetch une liste de Posts en GET
router.get("", PostController.getPosts);

// Fetch un post en particulier
router.get("/:id", PostController.getPost);

// Delete un Post en DELETE, Pour User connecté
router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;
