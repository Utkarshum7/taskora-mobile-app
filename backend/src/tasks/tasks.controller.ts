import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

// Guard + bearer auth applied once at the controller level — every route
// in this controller requires a valid JWT, and every query below is
// scoped to @CurrentUser()'s id, so one user can never read, edit, or
// delete another user's tasks (enforced in TasksService, not just here).
@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: "List the current user's tasks, with optional filtering/sorting",
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTasksDto,
  ) {
    return this.tasksService.findAllForUser(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by id' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.tasksService.findOneForUser(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (fields and/or completion status)' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    await this.tasksService.remove(user.id, id);
    return { message: 'Task deleted' };
  }
}
