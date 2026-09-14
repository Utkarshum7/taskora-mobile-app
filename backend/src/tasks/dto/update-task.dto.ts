import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

// PartialType makes every CreateTaskDto field optional (and keeps their
// validation rules when a field IS provided), so this only needs to add
// the one field unique to updates: toggling completion.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ description: 'Mark the task complete or incomplete' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
