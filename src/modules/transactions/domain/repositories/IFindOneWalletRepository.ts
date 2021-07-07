interface IFindOneWalletRepository {
  findOne(id: number): Promise<any | undefined>;
}

export { IFindOneWalletRepository };
