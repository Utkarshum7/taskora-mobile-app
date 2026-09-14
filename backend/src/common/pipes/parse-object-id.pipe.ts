import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Validates that a route param looks like a MongoDB ObjectId *before* it
 * reaches Mongoose. Without this, an id like "abc" would trigger a raw
 * Mongoose CastError deep inside a query — this pipe rejects it up front
 * with a clean 400 Bad Request instead.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" is not a valid id`);
    }
    return value;
  }
}
