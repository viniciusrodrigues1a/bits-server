interface IFindOneCategoryRepository {
  findOne(id: number): Promise<any | undefined>;
}

export { IFindOneCategoryRepository };
