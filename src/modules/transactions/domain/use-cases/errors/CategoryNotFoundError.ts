export class CategoryNotFoundError extends Error {
  constructor() {
    const message = 'Category not found';
    super(message);
    this.message = message;
  }
}
