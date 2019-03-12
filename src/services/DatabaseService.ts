import { injectable } from 'inversify';
import { createConnection, getConnection } from 'typeorm';

@injectable()
class DatabaseService {
  private readonly initialized: Promise<any>;
  constructor() {
    this.initialized = this.init();
  }

  public async init() {
    try {
      await createConnection(config.db);
    } catch (err) {
      console.log('Cannot Initialize DatabaseService', err);
      process.exit(2);
    }
  }

  public async getConnection() {
    await this.initialized;
    return getConnection();
  }
}

export default DatabaseService;
