import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';

const taskSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, default: null },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

type TaskAttrs = InferSchemaType<typeof taskSchema>;
export type TaskDoc = HydratedDocument<TaskAttrs>;
export const Task = model<TaskAttrs>('Task', taskSchema);
