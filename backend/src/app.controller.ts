import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint() // not a real API resource, just a liveness check — keep it out of Swagger
  getStatus() {
    return this.appService.getStatus();
  }
}
