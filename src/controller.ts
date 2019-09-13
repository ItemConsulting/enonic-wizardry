import { Error, ErrorKey, Response } from "enonic-fp/lib/common";
import { localize } from "enonic-fp/lib/i18n";
import { getOrElse } from 'fp-ts/lib/Option'

export const defaultStatusNumbers : { [key in ErrorKey]: number } = {
  "BadRequestError": 400,
  "UnauthorizedError": 401,
  "ForbiddenError": 403,
  "NotFoundError": 404,
  "MethodNotAllowedError": 405,
  "InternalServerError": 500,
  "BadGatewayError": 502,
  "PublishError": 500,
};

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

export function errorResponse(i18nPrefix: string, debug: boolean = false) : (err: Error) => Response {
  return (err: Error) => {
    const i18nKey = `${i18nPrefix}.${err.errorKey}`;

    return status(defaultStatusNumbers[err.errorKey], {
      message: getOrElse(() => i18nKey)(localize({ key: i18nKey })),
      cause: debug ? err.cause : undefined
    });
  };
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
    'X-Total-Count': String(total)
  };
  return response;
}
