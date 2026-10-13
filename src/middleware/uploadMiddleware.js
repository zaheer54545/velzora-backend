import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudnary.js";
import loadEnv from "../config/loadEnv.js";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../uploads");

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

// Cloudinary is used when its credentials are set in .env (same as before).
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "velzora/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Fully local fallback: saves into src/uploads (already served at /uploads by
// app.js) and exposes the public URL as `file.path`, which is the field the
// controllers already read from the Cloudinary storage.
const localStorage = {
  _handleFile(req, file, cb) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    const extension = path.extname(file.originalname || "").toLowerCase();
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
    const destination = path.join(UPLOADS_DIR, filename);
    const output = fs.createWriteStream(destination);

    file.stream.pipe(output);
    output.on("error", cb);
    output.on("finish", () => {
      cb(null, {
        path: `${req.protocol}://${req.get("host")}/uploads/${filename}`,
        filename,
        size: output.bytesWritten,
      });
    });
  },

  _removeFile(req, file, cb) {
    fs.unlink(path.join(UPLOADS_DIR, file.filename), () => cb(null));
  },
};

const storage = hasCloudinaryConfig ? cloudinaryStorage : localStorage;

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
