import container from '../ioc_container';
import EmailAnalyzerService from '../services/EmailAnalyzerService';
import MailboxService from '../services/MailboxService';
import IMAPService from '../services/IMAPService';

const test1 = {
  type: 'exact-keyword',
  data: ['chloroplast'],
  scope: 'any',
  check: {
    type: 'any'
  }
};

const test2 = {
  type: 'keyword',
  data: ['állás', 'munka', 'lehetőség', 'job'],
  scope: 'any',
  check: {
    type: 'any'
  }
};

const test3 = {
  type: 'sender',
  data: ['reethok@gmail.com'],
  check: {
    type: 'all'
  }
};

const t1 = {
  tag: 'exact',
  rules: [test1]
};

const t2 = {
  tag: 'keyword',
  rules: [test2]
};

const t3 = {
  tag: 'sender',
  rules: [test3]
};

const t4 = {
  tag: 'sender and exact',
  rules: [test1, test3]
};

async function emailAnalyzerCron() {
  console.log('CRON STARTED');
  const emailAnalyzerService = container.get<EmailAnalyzerService>(
    'EmailAnalyzerService'
  );
  const mailboxService = container.get<MailboxService>('MailboxService');
  const imapService = container.get<IMAPService>('IMAPService');

  const mailboxes = await mailboxService.mailboxRepository.find();
  for (const mailbox of mailboxes) {
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

    const connection = await imapService.connect(config);
    await imapService.openBox(connection, 'INBOX');

    let lastCheck;

    if (!mailbox.lastCheck) {
      lastCheck = new Date();
      lastCheck.setTime(Date.now() - 1000 * 60 * 15);
    } else {
      lastCheck = mailbox.lastCheck;
    }

    const uids = await imapService.getEmailUIDsFromDate(connection, lastCheck);

    let emails = [];

    for (const uid of uids) {
      const data = await imapService.getEmailByUID(connection, uid);
      const email = mailboxService.emailRepository.create(data);
      email.mailbox = mailbox;
      const tags = emailAnalyzerService.analyzeEmail(email, [t1, t2, t3, t4]);
      if (tags.length) {
        email.tags = tags;
        emails.push(email);
      }
      if (emails.length >= 10) {
        try {
          await mailboxService.emailRepository.save(emails);
          emails = [];
        } catch (err) {
          console.log('Couldnt save email', err);
        }
      }
    }

    try {
      mailbox.lastCheck = new Date();
      await mailboxService.emailRepository.save(emails);
      await mailboxService.mailboxRepository.save(mailbox);
      await connection.end();
      emails = [];
    } catch (err) {
      console.log('Couldnt save email', err);
    }
  }
}

export default emailAnalyzerCron;
