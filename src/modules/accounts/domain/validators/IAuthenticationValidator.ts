interface IAuthenticationValidator {
  validate(token: string): Promise<number | undefined>;
}

export { IAuthenticationValidator };
