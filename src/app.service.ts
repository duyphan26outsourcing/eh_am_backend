import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'eh-am-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
