import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

type UserAttrs = InferSchemaType<typeof userSchema>;
interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserDoc = HydratedDocument<UserAttrs, UserMethods>;

export const User = model<UserAttrs, import('mongoose').Model<UserAttrs, object, UserMethods>>(
  'User',
  userSchema,
);
