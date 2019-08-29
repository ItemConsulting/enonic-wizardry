import { Response } from "enonic-fp/lib/common";

function contentType(body: any) {
  return (typeof body === "string")
    ? 'text/html'
    : 'application/json';
}

export function status(status: number, body?: string | object) : Response {
  return {
    status,
    body,
    contentType: contentType(body)
  }
}

export const ok = (body: any) => status(200, body);

export const created = (body: any) => status(201, body);

export const noContent = () : Response => ({ status: 204, body: ''});

export const redirect = (redirect: string) : Response => ({ status: 303, redirect});

export const badRequest = (body: any) => status(400, body);

export const unauthorized = (body: any) => status(401, body);

export const forbidden = (body: any) =>  status(403, body);

export const notFound = (body: any) =>  status(404, body);

export const methodNotAllowed = (body: any) =>  status(405, body);

export const internalServerError = (body: any) =>  status(500, body);

export const badGateway = (body: any) =>  status(502, body);

export function setTotal(total: number, response: Response) : Response {
  response.headers = {
    'X-Total-Count': total
  };
  return response;
}
