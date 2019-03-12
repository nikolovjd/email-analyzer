import * as express from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpPost
} from 'inversify-express-utils';

@controller('/auth')
export class AuthController extends BaseHttpController {
  @httpPost('/register')
  public async register(req: express.Request) {
    const { username, password } = req.body;
    return this.json(req.body);
  }
}
