import { inject, injectable } from 'inversify';
import { IMailbox, INewUser, IUser } from '../types';
import { Repository } from 'typeorm';
import IMAPService from './IMAPService';
import EmailAnalyzerService from './EmailAnalyzerService';

interface IEmail {
  data: any;
}

type MailboxRepository = (s: any) => Promise<Repository<IMailbox>>;
type EmailRepository = (s: any) => Promise<Repository<IEmail>>;

@injectable()
class MailboxService {
  public mailboxRepository: Repository<IMailbox>;
  public emailRepository: Repository<IEmail>;

  constructor(
    @inject('RepositoryProvider')
    public mailboxRepositoryProvider: MailboxRepository,
    @inject('RepositoryProvider')
    public emailRepositoryProvider: EmailRepository,
    @inject('IMAPService') private imapService: IMAPService,
    @inject('EmailAnalyzerService') private analyzer: EmailAnalyzerService
  ) {}

  public async add(user: IUser, mailbox: IMailbox) {
    const newMailbox = this.mailboxRepository.create(mailbox);
    newMailbox.user = user;
    try {
      await this.mailboxRepository.save(newMailbox);
    } catch (err) {
      console.log('ERRRR', err);
      throw err;
    }
  }

  public async synchronize(mailbox: IMailbox) {
    // TODO
    const config = {
      imap: {
        user: mailbox.username,
        password: mailbox.password,
        host: mailbox.imapConfig.host,
        port: mailbox.imapConfig.port,
        tls: true,
        authTimeout: 3000
      }
    };
    const connection = await this.imapService.connect(cfg);
    await this.imapService.openBox(connection, 'INBOX');
    const uids = await this.imapService.getAllInboxUIDs(connection);

    let emails = [];

    for (const uid of uids) {
      const data = await this.imapService.getEmailByUID(connection, uid);
      const email = this.emailRepository.create(data);
      email.mailbox = mailbox;
      emails.push(email);
      if (emails.length >= 10) {
        try {
          await this.emailRepository.save(emails);
          emails = [];
        } catch (err) {
          console.log('ERRRRRRRRRR', err);
          throw new Error('DIEEEEE');
        }
      }
    }
    await this.emailRepository.save(emails);
  }
}

export default MailboxService;
