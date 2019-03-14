import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { User } from './User';
import { IImapConfig, IMailbox, INewUser, IRule } from '../types';
import { Email } from './Email';
import EncryptionService from '../services/EncryptionService';
import container from '../ioc_container';

@Entity()
export class Mailbox implements IMailbox {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  @IsEmail()
  public email: string;

  @Column()
  public username: string;

  @Column({
    transformer: {
      from: ciphertext => {
        if (ciphertext) {
          const enc: EncryptionService = container.get('EncryptionService');
          return enc.decrypt(ciphertext);
        }
      },
      to: plaintext => {
        if (plaintext) {
          const enc: EncryptionService = container.get('EncryptionService');
          return enc.encrypt(plaintext);
        }
      }
    }
  })
  public password: string;

  @Column('jsonb')
  public imapConfig: IImapConfig;

  @Column({
    default: false
  })
  public synchronized: boolean;

  @Column({
    nullable: true
  })
  public lastCheck: Date;

  @OneToOne(type => User)
  @JoinColumn()
  public user: User;

  @Column('jsonb', {
    default: []
  })
  public rules: IRule[];

  @OneToMany(type => Email, email => email.mailbox)
  public emails: Email[];

  constructor(data?: IMailbox) {
    if (data) {
      this.name = data.name;
      this.email = data.email;
      this.username = data.username;
      this.password = data.password;
      this.imapConfig = data.imapConfig;
    }
  }
}
