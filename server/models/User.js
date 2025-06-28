// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("User", userSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  password: { 
    type: String,
    select: false 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  facebookId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  provider: { 
    type: String, 
    enum: ['local', 'google', 'facebook'], 
    default: 'local' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  avatar: { 
    type: String 
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model("User", userSchema);