import { ApiProperty } from '@nestjs/swagger';

class SafeUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/** Swagger-only response shape for register/login — documents what the client receives. */
export class AuthResponseDto {
  @ApiProperty({ type: SafeUserDto })
  user: SafeUserDto;

  @ApiProperty({
    description: 'JWT bearer token to send as Authorization: Bearer <token>',
  })
  accessToken: string;
}
