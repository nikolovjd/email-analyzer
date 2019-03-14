import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

@injectable()
class IsAuthenticatedMiddleware extends BaseMiddleware {
  public async handler(req: Request, res: Response, next: NextFunction) {
    if (await this.httpContext.user.isAuthenticated()) {
      next();
    } else {
      return res.sendStatus(401);
    }
  }
}

export default IsAuthenticatedMiddleware;
