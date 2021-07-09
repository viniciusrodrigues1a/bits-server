import { Request, Response } from 'express';

function adaptExpressRoute(controller: any) {
  return async (request: Request, response: Response) => {
    const { statusCode, body } = await controller.handleRequest(request);

    return response.status(statusCode).json(body);
  };
}

export { adaptExpressRoute };
