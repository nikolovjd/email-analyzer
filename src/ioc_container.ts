import 'reflect-metadata';
import { Container } from 'inversify';
import { Entity, getConnection, Repository } from 'typeorm';

// Declare metadata by @controller annotation
import './controllers/auth';
import './controllers/mailbox';

const container = new Container();

// Import Services
import DatabaseService from './services/DatabaseService';
import AuthService from './services/AuthService';
import EncryptionService from './services/EncryptionService';
import UserService from './services/UserService';

// Entities for Repository Injection
import { User } from './entities/User';

// Middleware
import IsAuthenticatedMiddleware from './middleware/isAuthenticated';
import { Mailbox } from './entities/Mailbox';
import MailboxService from './services/MailboxService';
import IMAPService from './services/IMAPService';
import { Email } from './entities/Email';
import EmailAnalyzerService from './services/EmailAnalyzerService';

// Bind Services
container
  .bind<DatabaseService>('DatabaseService')
  .to(DatabaseService)
  .inSingletonScope();

container
  .bind<IMAPService>('IMAPService')
  .to(IMAPService)
  .inSingletonScope();

container
  .bind<AuthService>('AuthService')
  .to(AuthService)
  .inSingletonScope();

container
  .bind<UserService>('UserService')
  .to(UserService)
  .inSingletonScope();

container
  .bind<MailboxService>('MailboxService')
  .to(MailboxService)
  .inSingletonScope();

container
  .bind<EncryptionService>('EncryptionService')
  .to(EncryptionService)
  .inSingletonScope();

container
  .bind<EmailAnalyzerService>('EmailAnalyzerService')
  .to(EmailAnalyzerService)
  .inSingletonScope();

// Bind Middleware
container
  .bind<IsAuthenticatedMiddleware>('IsAuthenticatedMiddleware')
  .to(IsAuthenticatedMiddleware);

type RepositoryProvider = (t: any) => Promise<any>;

// Providers
container
  .bind<RepositoryProvider>('RepositoryProvider')
  .toProvider<Repository<any>>(context => {
    return async t => {
      const dbService = context.container.get<DatabaseService>(
        'DatabaseService'
      );
      const connection = await dbService.getConnection();
      return connection.getRepository(t);
    };
  });

const userService = container.get<UserService>('UserService');
userService.repositoryProvider(User).then(userRepository => {
  userService.userRepository = userRepository;
});

const mailboxService = container.get<MailboxService>('MailboxService');
mailboxService.mailboxRepositoryProvider(Mailbox).then(mailboxRepository => {
  mailboxService.mailboxRepository = mailboxRepository;
});
mailboxService.emailRepositoryProvider(Email).then(emailRepository => {
  mailboxService.emailRepository = emailRepository;
});

export default container;
