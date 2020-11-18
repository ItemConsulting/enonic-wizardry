import {Errors, Type} from 'io-ts';
import * as t from 'io-ts';
import {Either} from 'fp-ts/Either'
import {getErrorDetailReporter} from "./reporters/ErrorDetailReporter";
import {badRequestError, EnonicError} from 'enonic-fp/errors';
import {fromEither, IOEither, mapLeft} from "fp-ts/IOEither";
import {pipe} from "fp-ts/pipeable";
import {LocalizeWithPrefixParams} from "enonic-fp/controller";

export function validate<A, O = A, I = unknown>(a: Type<A, O, I>, localizeParams?: LocalizeWithPrefixParams): (i: I) => IOEither<EnonicError, A> {
  return (i: I): IOEither<EnonicError, A> => normalizeDecoded(a.decode(i), localizeParams);
}

export function normalizeDecoded<A>(decoded: Either<Errors, A>, localizeParams?: LocalizeWithPrefixParams): IOEither<EnonicError, A> {
  return pipe(
    decoded,
    fromEither,
    mapLeft(() => (
      {
        ...badRequestError,
        errors: getErrorDetailReporter(localizeParams).report(decoded)
      }
    ))
  );
}

export interface RegexpValidatedStringProps<A extends boolean = false> {
  readonly regexp: RegExp;
  readonly isNullable?: A;
}

export function RegexpValidatedString(props: RegexpValidatedStringProps): t.Type<string, string>;
export function RegexpValidatedString(props: RegexpValidatedStringProps<true>): t.Type<string | undefined, string | undefined>;
export function RegexpValidatedString<A extends string | undefined>({ regexp, isNullable = false }: RegexpValidatedStringProps<boolean>): t.Type<A, A> {
  return new t.Type<A, A, unknown>(
    'RegexpValidatedString',
    (u): u is A => (typeof u === "string" && regexp.test(u)) || (isNullable && u === undefined),
    (u, c) => {
      return (typeof u === "string" && regexp.test(u)) || (isNullable && u === undefined)
        ? t.success(u as A)
        : t.failure(u, c);
    },
    t.identity
  )
}

export interface MaxLengthValidatedStringProps<A extends boolean = false> {
  readonly maxLength: number;
  readonly isNullable?: A;
}

export function MaxLengthValidatedString(props: MaxLengthValidatedStringProps): t.Type<string, string>;
export function MaxLengthValidatedString(props: MaxLengthValidatedStringProps<true>): t.Type<string | undefined, string | undefined>;
export function MaxLengthValidatedString<A extends string | undefined>({ maxLength, isNullable = false }: MaxLengthValidatedStringProps<boolean>): t.Type<A, A> {
  return new t.Type<A, A, unknown>(
    'MaxLengthValidatedString',
    (u): u is A => (typeof u === "string" && u.length <= maxLength) || (isNullable && u === undefined),
    (u, c) => {
      return (typeof u === "string" && u.length <= maxLength) || (isNullable && u === undefined)
        ? t.success(u as A)
        : t.failure(u, c)
    },
    t.identity
  );
}

export interface MinMaxValidatedNumberProps<A extends boolean = false> {
  readonly min?: number;
  readonly max?: number;
  readonly isNullable?: A;
}

export function MinMaxValidatedNumber(props: MinMaxValidatedNumberProps): t.Type<string, string>;
export function MinMaxValidatedNumber(props: MinMaxValidatedNumberProps<true>): t.Type<string | undefined, string | undefined>;
export function MinMaxValidatedNumber<A extends number | undefined>({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, isNullable = false }: MinMaxValidatedNumberProps<boolean>): t.Type<A, A> {
  return new t.Type<A, A, unknown>(
    'MinMaxValidatedNumber',
    (u): u is A => (t.number.is(u) && (min <= u) && (u <= max)) || (isNullable && u === undefined),
    (u, c) => {
      return (t.number.is(u) && (min <= u) && (u <= max)) || (isNullable && u === undefined)
        ? t.success(u as A)
        : t.failure(u, c)
    },
    t.identity
  );
}
