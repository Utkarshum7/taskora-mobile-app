import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskPriority } from './task-priority.enum';

// Used to rank priority high-to-low when sort=priority is requested —
// Mongo can't sort a string enum into "high, medium, low" order on its
// own without this explicit weighting.
const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1,
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    return this.taskModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async findAllForUser(
    userId: string,
    query: QueryTasksDto,
  ): Promise<TaskDocument[]> {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.status === 'completed') {
      filter.isCompleted = true;
    } else if (query.status === 'pending') {
      filter.isCompleted = false;
    }
    // status === 'all' (or unset) applies no filter.

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.sort === 'priority') {
      // Fetched unsorted from Mongo, then sorted in memory by priority
      // weight. A single user's task list is small (dozens, not millions
      // of rows), so this trades a marginal amount of DB-side sorting
      // efficiency for code that's far easier to read than a
      // $addFields/$switch aggregation pipeline for the same result.
      const tasks = await this.taskModel.find(filter).exec();
      return tasks.sort(
        (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority],
      );
    }

    if (query.sort === 'deadline') {
      // Soonest deadline first; tasks with no deadline set sort to the
      // end regardless (MongoDB's native ascending sort would otherwise
      // put "no deadline" documents *first*, which reads as "most
      // urgent" — the opposite of what a user would expect).
      const tasks = await this.taskModel.find(filter).exec();
      return tasks.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      });
    }

    // Default: newest first.
    return this.taskModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOneForUser(userId: string, taskId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findOne({ _id: taskId, userId }).exec();
    // Same 404 whether the id doesn't exist at all or belongs to another
    // user — never confirm to a caller that a specific id exists if it
    // isn't theirs.
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: taskId, userId },
        { $set: dto },
        { new: true, runValidators: true },
      )
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const result = await this.taskModel
      .deleteOne({ _id: taskId, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }
}
