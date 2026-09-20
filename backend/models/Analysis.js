import mongoose from 'mongoose';

// The analysis payload is nested and evolves with the engine, so it is stored as
// a Mixed field; the fields we query/list on are top-level.
const analysisSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileType: String,
    candidateName: String,
    candidateEmail: String,
    resumeScore: { type: Number, required: true },
    jobMatch: Number,
    jobDescription: String,
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('Analysis', analysisSchema);
