import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Mailbox } from './Mailbox';
import { IEmail } from '../types';

@Entity()
@Unique(['uid', 'mailbox'])
export class Email implements IEmail {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('bytea', {
    nullable: true,
    transformer: {
      from: (b: Buffer) => b.toString('utf8'),
      to: s => (s ? Buffer.from(s) : null)
    }
  })
  public html: string;

  @Column('bytea', {
    nullable: true,
    transformer: {
      from: (b: Buffer) => b.toString('utf8'),
      to: s => (s ? Buffer.from(s) : null)
    }
  })
  public plain: string;

  @Column()
  public uid: number;

  @Column('jsonb')
  public header: any;

  @Column('jsonb')
  public tags: [];

  @ManyToOne(type => Mailbox, mailbox => mailbox.emails)
  public mailbox: Mailbox;
}
