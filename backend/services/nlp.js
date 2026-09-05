// Text preprocessing, TF-IDF vectorisation and cosine similarity, written from
// scratch so every step can be explained (no black-box ML library).

const STOPWORDS = new Set(`a about above after again against all am an and any are as at be because been before being below
between both but by can could did do does doing down during each few for from further had has have having he her here hers
herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or
other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these
they this those through to too under until up very was we were what when where which while who whom why will with would you
your yours yourself yourselves also etc via using use used within across per may must shall upon well like including include
e.g i.e`.split(/\s+/));

// Words that appear in almost every job description but say nothing about the
// required skills; excluded when ranking JD keywords.
const JD_NOISE = new Set(`job role position candidate candidates applicant company team teams work working looking join
responsibilities responsibility requirement requirements required qualification qualifications preferred plus good strong
excellent ability able knowledge understanding experience experienced year years month months skill skills opportunity
environment day new great help ensure related relevant least minimum ideal ideally key etc us our we'll you'll who will
apply hiring description based bonus nice have equivalent field degree various multiple other others similar familiar
familiarity proficiency proficient hands-on solid demonstrated proven passion passionate excellent effective effectively
across must desirable responsible duties seeking build building develop developing`.split(/\s+/));

// Light suffix-stripping stemmer: maps "developers"/"developing" close together
// without the over-stemming of a full Porter stemmer.
export function stem(word) {
  if (word.length <= 4 || /[+#.]/.test(word)) return word;
  let w = word;
  if (w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
  else if (w.endsWith('ing') && w.length > 6) w = w.slice(0, -3);
  else if (w.endsWith('ed') && w.length > 5) w = w.slice(0, -2);
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  // Drop a final "e" so "optimize" / "optimized" / "optimizing" share one stem.
  return w.length > 4 && w.endsWith('e') ? w.slice(0, -1) : w;
}

// Tokenise: lowercase, keep tech tokens like c++, c#, node.js; drop stopwords and numbers.
export function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.]*[a-z0-9+#]|[a-z]/g) || [])
    .map((t) => t.replace(/\.$/, ''))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// Returns [{stem, surface}] so we can show the original word to the user.
export function preprocess(text) {
  return tokenize(text).map((t) => ({ stem: stem(t), surface: t }));
}

const termFreq = (stems) => {
  const tf = new Map();
  for (const s of stems) tf.set(s, (tf.get(s) || 0) + 1);
  for (const [k, v] of tf) tf.set(k, v / stems.length);
  return tf;
};

// TF-IDF over a small corpus. Smoothed IDF (same formula as scikit-learn):
//   idf(t) = ln((1 + N) / (1 + df(t))) + 1
// The +1 keeps terms shared by both documents from getting weight 0 when N = 2.
export function tfidfVectors(docs) {
  const tfs = docs.map(termFreq);
  const N = docs.length;
  const df = new Map();
  for (const tf of tfs) for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  const idf = new Map([...df].map(([t, d]) => [t, Math.log((1 + N) / (1 + d)) + 1]));
  return tfs.map((tf) => new Map([...tf].map(([t, v]) => [t, v * idf.get(t)])));
}

// cos(A, B) = (A · B) / (|A| |B|)
export function cosineSimilarity(a, b) {
  let dot = 0;
  for (const [t, v] of a) if (b.has(t)) dot += v * b.get(t);
  const norm = (m) => Math.sqrt([...m.values()].reduce((s, v) => s + v * v, 0));
  const denom = norm(a) * norm(b);
  return denom ? dot / denom : 0;
}

// Ranks JD keywords by TF-IDF weight, then splits them into present / missing in the resume.
export function compareKeywords(resumeText, jdText, limit = 25) {
  const r = preprocess(resumeText);
  const j = preprocess(jdText);
  const [rVec, jVec] = tfidfVectors([r.map((x) => x.stem), j.map((x) => x.stem)]);
  const similarity = cosineSimilarity(rVec, jVec);

  const surface = new Map();
  for (const { stem: s, surface: w } of j) if (!surface.has(s)) surface.set(s, w);

  const resumeStems = new Set(r.map((x) => x.stem));
  const ranked = [...jVec]
    .filter(([t]) => !JD_NOISE.has(surface.get(t)) && !JD_NOISE.has(t) && t.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => ({ stem: t, word: surface.get(t) }));

  return {
    similarity,
    matching: ranked.filter((k) => resumeStems.has(k.stem)).map((k) => k.word),
    missing: ranked.filter((k) => !resumeStems.has(k.stem)).map((k) => k.word),
  };
}
