import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true  
  },
  filename: { 
    type: String, 
    required: true 
  },
  contentType: { 
    type: String, 
    required: true 
  },
  data: { 
    type: Buffer, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

imageSchema.virtual('url').get(function() {
  return `${process.env.CLIENT_URL}/api/images/${this._id}`;
});

export default mongoose.model('Image', imageSchema);