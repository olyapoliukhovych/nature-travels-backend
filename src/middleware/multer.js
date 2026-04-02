import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (request, file, callback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
        ),
        false,
      );
    }
  },

  //   if (file.mimetype.startsWith('image/')) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Only images allowed.'), false);
  //   }
  // },
});
