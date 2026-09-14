import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true, // normalize so "A@b.com" and "a@b.com" are the same account
    trim: true,
  })
  email: string;

  // select: false keeps this out of every query result by default — a
  // caller must explicitly opt in with .select('+passwordHash'), which
  // only AuthService.login does. This is defense-in-depth on top of the
  // response mapping that also strips it (see UsersService.toSafeUser).
  @Prop({ required: true, select: false })
  passwordHash: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
// Note: `unique: true` on the @Prop above already creates a unique index
// on `email` — no need to redeclare it here (doing so triggers Mongoose's
// "duplicate schema index" warning).
