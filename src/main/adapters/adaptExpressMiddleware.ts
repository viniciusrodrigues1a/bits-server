import { Request, Response, NextFunction } from 'express';

function adaptExpressMiddleware(middleware: any) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { statusCode, body } = await middleware.handleRequest(request);

    const is2xxStatusCode = statusCode.toString()[0] === '2';
    if (is2xxStatusCode) {
      return next();
    } else {
      return response.status(statusCode).json(body);
    }
  };
}

export { adaptExpressMiddleware };
