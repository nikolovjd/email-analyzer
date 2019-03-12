import { injectable } from 'inversify';
import crypto, { randomBytes } from 'crypto';

@injectable()
class EncryptionService {
  private readonly password: string;
  private readonly algorithm: string;

  constructor() {
    if (config.encryption && config.encryption.enabled) {
      this.password = config.encryption.password;
      this.algorithm = config.encryption.algorithm;
    }
  }

  public encrypt(data: string) {
    const iv = new Buffer(randomBytes(16));
    const cipher = crypto.createCipheriv(this.algorithm, this.password, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  public decrypt(data: string) {
    const parts = data.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedBuffer = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.password, iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}

export default EncryptionService;
