import { inject, injectable } from 'inversify';
import { INewUser, IUser } from '../types';
import { Repository } from 'typeorm';

type UserRepositoryProvider = (entity: any) => Promise<Repository<IUser>>;

@injectable()
class UserService {
  public userRepository: Repository<IUser>;

  constructor(
    @inject('RepositoryProvider')
    public repositoryProvider: UserRepositoryProvider
  ) {}

  public async register(user: INewUser) {
    const newUser = this.userRepository.create(user);
    try {
      await this.userRepository.save(newUser);
    } catch (err) {
      if (err.code === '23505') {
        const error = new Error('Username already exists!');
        error.status = 409;
        throw error;
      } else {
        console.error(err);
        throw new Error('Internal Server Error');
      }
    }
  }

  public async getByUsername(username: string): Promise<IUser | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  public async getById(id: number): Promise<IUser | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }
}

export default UserService;
