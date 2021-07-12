interface IDeleteTransactionUseCase {
  delete(id: number): Promise<boolean>;
}

export { IDeleteTransactionUseCase };
