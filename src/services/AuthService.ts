import { inject, injectable } from 'inversify';
import DatabaseService from './DatabaseService';

@injectable()
class AuthService {
  constructor(@inject('DatabaseService') private db: DatabaseService) {}

  public async registerUser({ username, password }) {
    // TODO
  }

  public async getUser(token: any) {
    return {
      id: 1,
      firstName: 'asdf',
      lastName: 'sdadada',
      email: 'hdajhdaj@hadjas.com'
    };
  }
}

export default AuthService;
