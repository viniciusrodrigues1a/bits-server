interface IDeleteTransactionRepository {
  delete(id: number): Promise<void>;
}

export { IDeleteTransactionRepository };
