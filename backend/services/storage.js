import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';
import User from '../models/User.js';

// Uses MongoDB when MONGODB_URI is set and reachable; otherwise a local JSON file,
// so the app always works for a demo. GET /api/health reports which one is active.
const JSON_FILE = path.resolve(import.meta.dirname, '../data/analyses.json');
const USERS_FILE = path.resolve(import.meta.dirname, '../data/users.json');
let mode = 'json';

export async function initStorage(uri) {
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      mode = 'mongodb';
      console.log('[storage] Connected to MongoDB');
      return mode;
    } catch (err) {
      console.warn(`[storage] MongoDB unavailable (${err.message}); falling back to local JSON file`);
    }
  }
  console.log(`[storage] Using local JSON file: ${JSON_FILE}`);
  return mode;
}

export const storageMode = () => mode;

async function readJson(file = JSON_FILE) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Write to a temp file then rename, so a crash mid-write cannot corrupt the store.
async function writeJson(records, file = JSON_FILE) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(records, null, 2));
  await fs.rename(tmp, file);
}

const toPlain = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  return { ...o, id: String(o._id ?? o.id), _id: undefined, __v: undefined };
};

export async function saveAnalysis(record) {
  if (mode === 'mongodb') return toPlain(await Analysis.create(record));
  const records = await readJson();
  const now = new Date().toISOString();
  const saved = { id: crypto.randomUUID(), ...record, createdAt: now, updatedAt: now };
  records.unshift(saved);
  await writeJson(records.slice(0, 500)); // ponytail: whole-file rewrite, fine for a demo; use MongoDB for scale
  return saved;
}

// Every read/delete is scoped to the logged-in user, so nobody can open another user's analysis.
export async function listAnalyses(userId, limit = 50) {
  if (mode === 'mongodb') {
    const docs = await Analysis.find({ userId }, { result: 0, jobDescription: 0 }).sort({ createdAt: -1 }).limit(limit).lean();
    return docs.map(toPlain);
  }
  return (await readJson()).filter((r) => r.userId === userId).slice(0, limit).map(({ result, jobDescription, ...rest }) => rest);
}

export async function getAnalysis(id, userId) {
  if (mode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await Analysis.findOne({ _id: id, userId }).lean();
    return doc && toPlain(doc);
  }
  return (await readJson()).find((r) => r.id === id && r.userId === userId) || null;
}

export async function deleteAnalysis(id, userId) {
  if (mode === 'mongodb') {
    if (!mongoose.isValidObjectId(id)) return false;
    return Boolean(await Analysis.findOneAndDelete({ _id: id, userId }));
  }
  const records = await readJson();
  const next = records.filter((r) => !(r.id === id && r.userId === userId));
  if (next.length === records.length) return false;
  await writeJson(next);
  return true;
}

export async function findUserByEmail(email) {
  if (mode === 'mongodb') {
    const doc = await User.findOne({ email }).lean();
    return doc && toPlain(doc);
  }
  return (await readJson(USERS_FILE)).find((u) => u.email === email) || null;
}

export async function createUser({ email, passwordHash }) {
  if (mode === 'mongodb') return toPlain(await User.create({ email, passwordHash }));
  const users = await readJson(USERS_FILE);
  const user = { id: crypto.randomUUID(), email, passwordHash, createdAt: new Date().toISOString() };
  await writeJson([...users, user], USERS_FILE);
  return user;
}
