import { injectable, inject } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import Principal from '../Principal';

const authService = inject('AuthService');

@injectable()
class AuthProvider implements interfaces.AuthProvider {
  @authService private readonly authService: AuthService;

  public async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<interfaces.Principal> {
    const token = req.headers['x-auth-token'];
    const user = await this.authService.getUserFromToken(token as string);
    if (user && user.id) {
      return new Principal(user, true);
    } else {
      return new Principal({}, false);
    }
  }
}

export default AuthProvider;
