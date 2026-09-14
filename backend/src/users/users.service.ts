import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SafeUser } from './interfaces/safe-user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Plain find — passwordHash is excluded by the schema's select:false. */
  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  /**
   * Used only by login, which needs to compare the submitted password
   * against the stored hash — the one place passwordHash must be loaded.
   */
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  create(email: string, passwordHash: string): Promise<UserDocument> {
    return this.userModel.create({
      email: email.toLowerCase().trim(),
      passwordHash,
    });
  }

  /** Maps a Mongoose user document to the only shape allowed to leave the API. */
  toSafeUser(user: UserDocument): SafeUser {
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt as Date,
      updatedAt: user.updatedAt as Date,
    };
  }
}
