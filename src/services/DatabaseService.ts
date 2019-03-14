import { injectable } from 'inversify';
import { createConnection, getConnection } from 'typeorm';
import { Mailbox } from '../entities/Mailbox';
import { User } from '../entities/User';

@injectable()
class DatabaseService {
  public entities: any;

  private readonly initialized: Promise<any>;
  private readonly config: any;

  constructor() {
    // TODO: find a better way. Seems like TypeORM is trying to assign to a param in config, which is deepFrozen
    this.config = Object.assign({}, config.db);
    this.initialized = this.init();
    this.entities = {
      User,
      Mailbox
    };
  }

  public async init() {
    try {
      await createConnection(this.config);
      console.log('DBS initialized');
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
