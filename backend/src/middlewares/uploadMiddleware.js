import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../services/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'recipehub',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  },
});

export const upload = multer({ storage });
