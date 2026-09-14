import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { TaskPriority } from '../task-priority.enum';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';
export type TaskSortField = 'createdAt' | 'deadline' | 'priority';

export class QueryTasksDto {
  @ApiPropertyOptional({
    enum: ['all', 'pending', 'completed'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'pending', 'completed'], {
    message: 'status must be one of: all, pending, completed',
  })
  status?: TaskStatusFilter;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsIn(Object.values(TaskPriority), {
    message: 'priority must be one of: low, medium, high',
  })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    enum: ['createdAt', 'deadline', 'priority'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'deadline', 'priority'], {
    message: 'sort must be one of: createdAt, deadline, priority',
  })
  sort?: TaskSortField;
}
