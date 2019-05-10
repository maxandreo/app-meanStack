const Post = require("../models/post");

// Create a new post en POST, Pour User connecté
exports.createPost =  (req, res, next) => {
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
}

// Update un Post en PUT, Pour User connecté
exports.updatePost = (req, res, next) => {
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
      if (result.n > 0) {
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
}

// Fetch une liste de Posts en GET
exports.getPosts = (req, res, next) => {
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
}

// Fetch un post en particulier
exports.getPost = (req, res, next) => {
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
}

// Delete un Post en DELETE, Pour User connecté
exports.deletePost =   (req, res, next) => {
  Post.deleteOne({
    _id: req.params.id,
    creator: req.userData.userId
  })
    .then(result => {
      // console.log(result);
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
}
