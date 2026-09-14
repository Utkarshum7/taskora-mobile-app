import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { TaskPriority } from '../task-priority.enum';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  // Indexed — every task query is filtered by owner, so this is the
  // single most important index in the collection.
  // NOTE: must reference the SchemaType (`MongooseSchema.Types.ObjectId`),
  // not the driver-level `Types.ObjectId` constructor — the latter looks
  // identical here but silently breaks automatic string->ObjectId casting
  // on query filters for this path (confirmed by direct testing), even
  // though it works fine for document creation.
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  // The task's own date/time (e.g. when it's scheduled to be worked on).
  @Prop()
  scheduledAt?: Date;

  // When the task is due.
  @Prop()
  deadline?: Date;

  @Prop({
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ trim: true, maxlength: 50 })
  category?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Common access pattern is "this user's tasks, newest first" — a compound
// index keeps that query (and the userId-only filter) fast as data grows.
TaskSchema.index({ userId: 1, createdAt: -1 });
