import mongoose from 'mongoose';

const tokenSubSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedBy: { type: String } // hash of the replacing token, if rotated
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    onboarding: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    },
    preferences: {
      notifications: { type: Object, default: {} }
    },
    tokens: {
      refresh: { type: [tokenSubSchema], default: [] }
    },
    verification: {
      tokenHash: { type: String },
      expiresAt: { type: Date }
    },
    passwordReset: {
      tokenHash: { type: String },
      expiresAt: { type: Date }
    }
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    emailVerified: this.emailVerified,
    onboarding: this.onboarding,
    preferences: { notifications: this.preferences?.notifications || {} },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const User = mongoose.model('User', userSchema);
