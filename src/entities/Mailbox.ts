import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail } from 'class-validator';

interface IImapConfig {
  host: string;
  port: number;
  secure: boolean;
}

@Entity()
export class Mailbox {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  @IsEmail()
  public email: string;

  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column('jsonb')
  public imapConfig: IImapConfig;
}
