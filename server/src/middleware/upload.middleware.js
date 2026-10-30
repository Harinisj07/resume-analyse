import multer from 'multer';
import path from 'path';

// Store uploaded files in memory as Buffers for direct forwarding to AI Microservice
const storage = multer.memoryStorage();

// Supported file extensions and MIME types
const allowedExtensions = ['.pdf', '.docx', '.txt'];
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${ext || mime}. Please upload a PDF (.pdf), Word Document (.docx), or Text file (.txt).`
      ),
      false
    );
  }
};

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter,
});

export default uploadResume;
