// models/Album.js
import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  createdAt: { type: Date, default: Date.now }
});

albumSchema.index({ user: 1, title: 1 }, { unique: true });
export default mongoose.model('Album', albumSchema);