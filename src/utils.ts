import { IOEither, fromEither} from 'fp-ts/lib/IOEither';
import { Option, some, filter, map } from 'fp-ts/lib/Option';
import * as E from 'fp-ts/lib/Either';
import { pipe } from "fp-ts/lib/pipeable";
import { Request, EnonicError } from "enonic-fp/lib/common";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function substringAfter (path: string, separator = "/"): Option<string> {
  return pipe(
    some(path.lastIndexOf(separator)),
    filter(index => index != -1),
    map(index => path.substr(index + 1))
  );
}

export function json(req: Request, errorMessage = "Unable to parse json from request"): IOEither<EnonicError, any> {
  return fromEither(
    E.parseJSON<EnonicError>(req.body,
      () => ({
        errorKey: "BadRequestError",
        errors: {
          message: [errorMessage]
        }
      })
    )
  );
}

export function getUuidFromPath (path: string): Option<string> {
  return pipe(
    substringAfter(path),
    filter((str: string) => UUID_REGEX.test(str))
  );
}

export function forceArray<A>(data?: A | ReadonlyArray<A>): ReadonlyArray<A> {
  data = data || [];
  return Array.isArray(data)
    ? data
    : [data];
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
