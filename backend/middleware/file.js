const multer = require('multer'); // Pour parse un upload

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

module.exports = multer({storage: storage}).single("image");
