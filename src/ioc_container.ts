import 'reflect-metadata';
import { Container } from 'inversify';

// Declare metadata by @controller annotation
import './controllers/auth';

const container = new Container();

// Import Services
import DatabaseService from './services/DatabaseService';
import AuthService from './services/AuthService';
import EncryptionService from './services/EncryptionService';

// Bind Services
container
  .bind<DatabaseService>('DatabaseService')
  .to(DatabaseService)
  .inSingletonScope();

container
  .bind<AuthService>('AuthService')
  .to(AuthService)
  .inSingletonScope();

container
  .bind<EncryptionService>('EncryptionService')
  .to(EncryptionService)
  .inSingletonScope();

export default container;
