import * as express from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost
} from 'inversify-express-utils';
import AuthService from '../services/AuthService';
import EncryptionService from '../services/EncryptionService';
import UserService from '../services/UserService';
import { IUser } from '../types';

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject('AuthService') private authService: AuthService,
    @inject('UserService') private userService: UserService,
    @inject('EncryptionService') private enc: EncryptionService
  ) {
    super();
  }

  @httpPost('/register')
  public async register(req: express.Request) {
    const { username, password } = req.body;
    if (!username || !password) {
      return this.json({ error: 'Invalid Request' }, 422);
    }
    // hash password
    const hash = await this.authService.hashPassword(password);

    const user = this.userService;

    try {
      await this.userService.register({ username, password: hash });
      return this.json({ message: 'ok' });
    } catch (err) {
      return this.json({ error: err.message }, err.status || 500);
    }
  }

  @httpPost('/login')
  public async login(req: express.Request) {
    const { username, password } = req.body;
    if (!username || !password) {
      return this.json({ error: 'Invalid Request' }, 422);
    }

    const user: IUser = await this.userService.getByUsername(username);

    if (!user) {
      return this.json({ error: 'Invalid credentials' }, 401);
    }

    const authenticated = await this.authService.verifyPassword(
      password,
      user.password
    );

    if (authenticated) {
      const refreshToken = this.authService.createAccessToken(user);
      return this.json({
        refreshToken
      });
    } else {
      return this.json({ error: 'Invalid credentials' }, 401);
    }
  }

  @httpGet('/encrypt/:whatever')
  public async a(req: express.Request) {
    return this.enc.encrypt(req.params.whatever);
  }

  @httpGet('/decrypt/:whatever')
  public async b(req: express.Request) {
    return this.enc.decrypt(req.params.whatever);
  }
}
