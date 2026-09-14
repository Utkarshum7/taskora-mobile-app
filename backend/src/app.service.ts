import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /** Simple liveness payload for GET / — useful to confirm the API is up. */
  getStatus() {
    return { status: 'ok', service: 'Modulus17 backend' };
  }
}
