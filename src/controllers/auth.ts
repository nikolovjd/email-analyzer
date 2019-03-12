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

@controller('/auth')
export class AuthController extends BaseHttpController {
  constructor(
    @inject('AuthService') private authService: AuthService,
    @inject('EncryptionService') private enc: EncryptionService
  ) {
    super();
  }

  @httpPost('/register')
  public async register(req: express.Request) {
    const { username, password } = req.body;
    return this.json(req.body);
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
