import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';

const inviteSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    token: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

type InviteAttrs = InferSchemaType<typeof inviteSchema>;
export type InviteDoc = HydratedDocument<InviteAttrs>;
export const Invite = model<InviteAttrs>('Invite', inviteSchema);
