const multer = require('multer');
const { cloudinary } = require('../../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

exports.uploadCloud = (file1, file2) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: `${file.fieldname}`,
        resource_type: file.fieldname === 'video' ? 'video' : 'image',
        public_id: `${Date.now()}-${file.originalname}`,
      };
    },
  });
  //? handle video table upload file
  fileFilterVideo = (req, file, cb) => {
    if (file.fieldname === file1) {
      if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = {
          message: 'Only image files are allowed!',
        };
        return cb(new Error('Only image files are allowed!'), false);
      }
    }

    if (file.fieldname === file2) {
      if (!file.originalname.match(/\.(mp4)$/)) {
        req.fileValidationError = {
          message: 'Only Video files are allowed!',
        };
        return cb(new Error('Only Video files are allowed!'), false);
      }
    }
    cb(null, true);
  };

  //? handle channel table upload file
  fileFilterChannel = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = {
        message: 'Only image files are allowed!',
      };
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  };

  const maxSize = 200 * 1024 * 1024;

  const upload = multer({
    storage,
    fileFilter: file2 == 'video' ? fileFilterVideo : fileFilterChannel,
    limits: { fileSize: maxSize },
  }).fields([
    {
      name: file1,
      maxCount: 1,
    },
    {
      name: file2,
      maxCount: 1,
    },
  ]);

  //? Middleware
  return (req, res, next) => {
    upload(req, res, (err) => {
      //! Error validation
      if (req.fileValidationError)
        return res.status(400).send(req.fileValidationError);

      //! Error file not selected
      if (!req.files && !err)
        return res.status(400).send({
          message: 'Please select files to upload',
        });

      //! Error over size limits
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send({
            message: 'Max file sized 200MB',
          });
        }
        return res.status(400).send(err);
      }
      //? Next to controller
      return next();
    });
  };
};
