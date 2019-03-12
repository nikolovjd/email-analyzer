import 'reflect-metadata';
import { Container } from 'inversify';

// Declare metadata by @controller annotation
import './controllers/auth';

const container = new Container();

// Import Services
import DatabaseService from './services/DatabaseService';

// Bind Services
container
  .bind<DatabaseService>('DatabaseService')
  .to(DatabaseService)
  .inSingletonScope();

export default container;
