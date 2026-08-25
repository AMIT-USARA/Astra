import multer from 'multer';
import path from 'node:path';

const MAX_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);
const ALLOWED = {
  '.pdf': ['application/pdf'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream', 'application/zip'],
};

// Files are kept in memory and never written to disk, so there are no temp files
// to clean up and no uploaded content left on the server.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED[ext]) return cb(httpError(400, 'Only PDF and DOCX files are allowed.'));
    if (!ALLOWED[ext].includes(file.mimetype)) return cb(httpError(400, `File content type ${file.mimetype} does not match ${ext}.`));
    cb(null, true);
  },
});

// Extension and MIME type come from the client, so also check the file's magic bytes.
export function verifySignature(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const head = file.buffer.subarray(0, 4).toString('latin1');
  if (ext === '.pdf' && !head.startsWith('%PDF')) throw httpError(400, 'File is not a valid PDF.');
  if (ext === '.docx' && !head.startsWith('PK')) throw httpError(400, 'File is not a valid DOCX document.');
  return ext;
}

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export { MAX_MB };
