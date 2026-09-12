import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const originalNameWithoutExt = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${originalNameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
});
