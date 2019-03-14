import { interfaces } from 'inversify-express-utils';

class Principal implements interfaces.Principal {
  public details: any;
  public authenticated: boolean;

  public constructor(details: any, authenticated: boolean) {
    this.details = details;
    this.authenticated = authenticated;
  }
  public async isAuthenticated(): Promise<boolean> {
    return !!this.authenticated;
  }
  public isResourceOwner(resourceId: any): Promise<boolean> {
    // TODO:
    return Promise.resolve(resourceId === 1111);
  }
  public isInRole(role: string): Promise<boolean> {
    // TODO:
    return Promise.resolve(role === 'admin');
  }
}

export default Principal;
