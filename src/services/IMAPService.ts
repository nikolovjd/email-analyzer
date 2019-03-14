import { injectable } from 'inversify';
import imap, { ImapSimple } from 'imap-simple';

const emailRx = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

@injectable()
class IMAPService {
  public async connect(config) {
    return imap.connect(config);
  }

  public async disconnect() {
    return imap.logout();
  }

  public async openBox(connection, box: string) {
    return connection.openBox(box);
  }

  public async getAllInboxUIDs(connection) {
    const searchCriteria = ['1:*'];
    const fetchOptions = {
      bodies: [],
      struct: false
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    return messages.map(message => message.attributes.uid);
  }

  public async getEmailUIDsFromDate(connection, date: Date) {
    console.log(date.toISOString());
    const searchCriteria = ['1:*', ['SINCE', date.toISOString()]];
    const fetchOptions = {
      bodies: [],
      struct: false
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    return messages
      .filter(message => {
        return new Date(message.attributes.date) > date;
      })
      .map(message => message.attributes.uid);
  }

  public async getEmailByUID(connection, uid: number) {
    try {
      console.log('uid', uid);
      const searchCriteria = [['UID', uid]];
      const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT CC)', 'TEXT'],
        struct: true
      };
      const message = (await connection.search(
        searchCriteria,
        fetchOptions
      ))[0];

      const messageHeader = message.parts.find(
        part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT CC)'
      ).body;

      messageHeader.date = message.attributes.date;
      messageHeader.from = this.emailsToFlatArray(messageHeader.from);
      messageHeader.to = this.emailsToFlatArray(messageHeader.to);

      if (messageHeader.cc) {
        messageHeader.cc = this.emailsToFlatArray(messageHeader.cc);
      }

      // Filter out attachments
      const messageParts = imap
        .getParts(message.attributes.struct)
        .filter(
          part =>
            !(
              part.disposition &&
              part.disposition.type.toUpperCase() === 'ATTACHMENT'
            )
        );

      const plainParts = messageParts.filter(
        part => part.type === 'text' && part.subtype === 'plain'
      );

      const htmlParts = messageParts.filter(
        part => part.type === 'text' && part.subtype === 'html'
      );

      if (plainParts.length > 1) {
        console.log('this shoudlnt happen', plainParts);
      }

      if (htmlParts.length > 1) {
        console.log('this shoudlnt happen', htmlParts);
      }

      let plain;
      let html;

      if (plainParts.length) {
        try {
          plain = await connection.getPartData(message, plainParts[0]);
          plain = Buffer.from(plain);
          plain = plain.toString();
        } catch (err) {
          console.log('COULDNT GET PART DATA', err);
        }
      }

      if (htmlParts.length) {
        try {
          html = await connection.getPartData(message, htmlParts[0]);
          html = Buffer.from(html);
          html = html.toString();
        } catch (err) {
          console.log('COULDNT GET PART DATA', err);
        }
      }

      /*for (const attachment of messageAttachments) {
        // TODO: find error Error: Invalid continuation byte
        const partDataBuffer: Buffer = await connection.getPartData(
          message,
          attachment
        );
        console.log(6);
        const partDataBase64 = partDataBuffer.toString('base64');
        attachments.push({
          meta: attachment,
          filename: attachment.disposition.params.filename,
          data: partDataBase64
        });
      }*/

      return {
        header: messageHeader,
        uid,
        plain,
        html
      };
    } catch (err) {
      console.log('ERRRR', err);
    }
  }

  private emailsToFlatArray(input: []) {
    return input
      .map(sender => {
        const emails = sender.match(emailRx);
        if (emails && emails.length) {
          return emails;
        }
        return null;
      })
      .reduce((prev, next) => prev.concat(next))
      .filter(email => !!email);
  }
}

export default IMAPService;
