import { IUser } from "server/types/user";


class UserStorage {
  private storage: Map<number, IUser>;

  constructor() {
    this.storage = new Map();
  }

  // 添加或更新用户
  set(user: IUser): void {
    if (!user.id) {
      throw new Error("User must have an id");
    }
    this.storage.set(user.id, user);
  }

  // 获取用户
  get(userId: number): IUser | undefined {
    return this.storage.get(userId);
  }

  // 检查用户是否存在
  has(userId: number): boolean {
    return this.storage.has(userId);
  }

  // 删除用户
  delete(userId: number): boolean {
    return this.storage.delete(userId);
  }

  // 获取所有用户
  getAll(): IUser[] {
    return Array.from(this.storage.values());
  }

  // 获取用户数量
  size(): number {
    return this.storage.size;
  }

  // 清空存储
  clear(): void {
    this.storage.clear();
  }
}

const userStorage = new UserStorage();
export default userStorage;