import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'new_comment'
  | 'member_joined'
  | 'invite_accepted'
  | 'invite_received';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['task_assigned', 'new_comment', 'member_joined', 'invite_accepted', 'invite_received'],
      required: true,
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

type NotificationAttrs = InferSchemaType<typeof notificationSchema>;
export type NotificationDoc = HydratedDocument<NotificationAttrs>;
export const Notification = model<NotificationAttrs>('Notification', notificationSchema);
