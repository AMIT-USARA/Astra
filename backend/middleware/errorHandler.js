import multer from 'multer';
import { MAX_MB } from './upload.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? `File is too large. Maximum size is ${MAX_MB} MB.` : message;
  }
  if (err.code === 11000) {
    status = 409; // MongoDB unique index (two sign-ups with the same email at once)
    message = 'An account with this email already exists. Please log in.';
  }
  if (status >= 500) {
    console.error(err);
    message = 'Something went wrong while processing the request.';
  }
  res.status(status).json({ success: false, message });
}
