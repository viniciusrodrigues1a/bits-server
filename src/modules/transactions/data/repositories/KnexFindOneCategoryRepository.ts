import Knex from 'knex';
import { IFindOneCategoryRepository } from '../../domain/repositories';

class KnexFindOneCategoryRepository implements IFindOneCategoryRepository {
  constructor(private connection: Knex) {}

  async findOne(id: number): Promise<any> {
    const category = await this.connection('category')
      .where({ id })
      .select('*')
      .first();

    return category;
  }
}

export { KnexFindOneCategoryRepository };
