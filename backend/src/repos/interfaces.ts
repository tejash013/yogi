export interface IUserRepo {
  findByEmail(email: string): Promise<any | null>;
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, update: any): Promise<any | null>;
}

export interface IPaginated<T> {
  items: T[];
  total: number;
}

export interface IOrderRepo {
  count(filter: any): Promise<number>;
  findPaginated(filter: any, page: number, limit: number, sort?: any): Promise<IPaginated<any>>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  updateById(id: string, update: any): Promise<any | null>;
  findByUser(userId: string): Promise<any[]>;
}
