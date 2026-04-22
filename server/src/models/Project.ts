import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';

export type ProjectRole = 'owner' | 'admin' | 'member';

const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [memberSchema], default: [] },
    columns: {
      type: [{ id: String, title: String }],
      default: [
        { id: 'todo', title: 'To Do' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'done', title: 'Done' },
      ],
    },
  },
  { timestamps: true },
);

type ProjectAttrs = InferSchemaType<typeof projectSchema>;
export type ProjectDoc = HydratedDocument<ProjectAttrs>;

export const Project = model<ProjectAttrs>('Project', projectSchema);
