import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { INewUser, IUser } from '../types';

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public username: string;

  @Column()
  public password: string;

  constructor(data?: INewUser) {
    if (data) {
      this.username = data.username;
      this.password = data.password;
    }
  }
}
