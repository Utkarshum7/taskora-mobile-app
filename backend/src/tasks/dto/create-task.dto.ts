import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '../task-priority.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Finish assignment README' })
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Write setup steps and API summary' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '2025-06-01T09:00:00.000Z',
    description: 'ISO 8601 date-time',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'scheduledAt must be a valid ISO 8601 date-time' },
  )
  scheduledAt?: string;

  @ApiPropertyOptional({
    example: '2025-06-02T18:00:00.000Z',
    description: 'ISO 8601 date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'deadline must be a valid ISO 8601 date-time' })
  deadline?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'priority must be one of: low, medium, high',
  })
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 'work' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
