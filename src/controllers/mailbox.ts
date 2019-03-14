import * as express from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  HttpContent,
  httpGet,
  httpPost
} from 'inversify-express-utils';
import EncryptionService from '../services/EncryptionService';
import MailboxService from '../services/MailboxService';
import EmailAnalyzerService from '../services/EmailAnalyzerService';

@controller('/mailbox', 'IsAuthenticatedMiddleware')
export class MailboxController extends BaseHttpController {
  constructor(
    @inject('MailboxService') private mailboxService: MailboxService,
    @inject('EncryptionService') private enc: EncryptionService,
    @inject('EmailAnalyzerService')
    private emailAnalyzerService: EmailAnalyzerService
  ) {
    super();
  }

  @httpGet('/test')
  public async test(req: express.Request, res: express.Response) {
    const mail = await this.mailboxService.emailRepository.findOne({
      where: { uid: 29 }
    });

    this.emailAnalyzerService.analyzeEmail(mail, null);

    return res.send(mail.html);
  }

  @httpPost('/')
  public async addMailbox(req: express.Request) {
    const { name, email, username, password, imapConfig } = req.body;

    await this.mailboxService.add(this.httpContext.user.details, {
      name,
      email,
      username,
      password,
      imapConfig
    });
  }
}
