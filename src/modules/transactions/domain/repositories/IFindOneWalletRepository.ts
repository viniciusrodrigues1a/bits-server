interface IFindOneWalletRepository {
  findOne(id: number): Promise<any | null>;
}

export { IFindOneWalletRepository };
