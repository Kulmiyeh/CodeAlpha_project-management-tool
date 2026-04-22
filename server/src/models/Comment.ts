import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';

const commentSchema = new Schema(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

type CommentAttrs = InferSchemaType<typeof commentSchema>;
export type CommentDoc = HydratedDocument<CommentAttrs>;
export const Comment = model<CommentAttrs>('Comment', commentSchema);
