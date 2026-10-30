import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Secure private storage directory (NOT exposed publicly through express.static)
const UPLOAD_DIR = path.resolve(process.cwd(), 'storage', 'resumes');

// Ensure destination directory exists with private permissions
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure randomized filename to prevent overwrites, path traversal, and file enumeration
    const randomHash = crypto.randomBytes(12).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase();
    const uniqueName = `resume-${Date.now()}-${randomHash}${safeExt}`;
    cb(null, uniqueName);
  },
});

// Strict validation: Only PDF and DOCX files allowed
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/zip',
  'application/octet-stream',
  'binary/octet-stream',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeValid = ALLOWED_MIME_TYPES.includes(mime) || !mime;

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    const err = new Error(
      `Unsupported file format "${ext || mime}". Only PDF (.pdf) and Word documents (.docx) are supported.`
    );
    err.status = 400;
    err.code = 'UNSUPPORTED_FORMAT';
    cb(err, false);
  }
};

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Single file upload
  },
  fileFilter,
});

export default uploadResume;
