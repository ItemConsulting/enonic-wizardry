import {Errors, Type} from 'io-ts';
import * as t from 'io-ts';
import {Either, either} from 'fp-ts/Either'
import {getErrorDetailReporter} from "./reporters/ErrorDetailReporter";
import {badRequestError, EnonicError} from 'enonic-fp/errors';
import {fromEither, IOEither, mapLeft} from "fp-ts/IOEither";
import {pipe} from "fp-ts/pipeable";

export function validate<A, O = A, I = unknown>(a: Type<A, O, I>, i18nPrefix?: string): (i: I) => IOEither<EnonicError, A> {
  return (i: I): IOEither<EnonicError, A> => {
    const decoded: Either<Errors, A> = a.decode(i);

    return pipe(
      decoded,
      fromEither,
      mapLeft(() => (
        {
          ...badRequestError,
          errors: getErrorDetailReporter(i18nPrefix).report(decoded)
        }
      ))
    )
  };
}

export const RegexpValidatedString = (regexp: RegExp): t.Type<string, string, unknown> => new t.Type<string, string, unknown>(
  'RegexpValidatedString',
  (u): u is string => t.string.is(u) && regexp.test(String(u)),
  (u, c) =>
    either.chain(t.string.validate(u, c), s => {
      return regexp.test(s) ? t.success(s) : t.failure(u, c)
    }),
  t.identity
);

export const MaxLengthValidatedString = (maxLength: number): t.Type<string, string, unknown> => new t.Type<string, string, unknown>(
  'MaxLengthValidatedString',
  (u): u is string => t.string.is(u) && u.length <= maxLength,
  (u, c) =>
    either.chain(t.string.validate(u, c), s => {
      return s.length <= maxLength ? t.success(s) : t.failure(u, c)
    }),
  t.identity
);
