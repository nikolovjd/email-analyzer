import { inject, injectable } from 'inversify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser } from '../types';
import UserService from './UserService';

@injectable()
class AuthService {
  constructor(@inject('UserService') private userService: UserService) {}

  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.auth.hashRounds);
    return bcrypt.hash(password, salt);
  }

  public async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public createAccessToken(user: IUser) {
    // Remove password from token
    return jwt.sign({ id: user.id }, 'secret');
  }

  public validateAccessToken(token: string) {
    return jwt.verify(token, 'secret');
  }

  public async getUserFromToken(token: string) {
    try {
      const { id } = this.validateAccessToken(token);
      return this.userService.getById(id);
    } catch (err) {
      return null;
    }
  }
}

export default AuthService;
