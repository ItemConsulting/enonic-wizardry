import * as E from 'fp-ts/lib/Either';
import { Option, some, filter, map } from 'fp-ts/lib/Option';
import { pipe } from "fp-ts/lib/pipeable";
import { Request, Error } from "enonic-fp/lib/common";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function substringAfter (path: string, separator: string = "/") : Option<string> {
  return pipe(
    some(path.lastIndexOf(separator)),
    filter(index => index != -1),
    map(index => path.substr(index + 1))
  );
}

export function json(req: Request) : E.Either<Error, any> {
  return E.parseJSON<Error>(req.body, e => ({
    errorKey: "BadRequestError",
    cause: String(e)
  }));
}

export function getUuidFromPath (path: string) : Option<string> {
  return pipe(
    substringAfter(path),
    filter((str: string) => UUID_REGEX.test(str))
  );
}

export function forceArray(data : any) {
  data = data || [];
  return Array.isArray(data)
    ? data
    : [data];
}

export function uuidv4() : string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
