import {Errors, Type} from 'io-ts';
import * as t from 'io-ts';
import {Either} from 'fp-ts/Either'
import {getErrorDetailReporter} from "./reporters/ErrorDetailReporter";
import {badRequestError, EnonicError} from 'enonic-fp/errors';
import {fromEither, IOEither, mapLeft} from "fp-ts/IOEither";
import {pipe} from "fp-ts/pipeable";

export function validate<A, O = A, I = unknown>(a: Type<A, O, I>, params?: ValidateParams): (i: I) => IOEither<EnonicError, A> {
  return (i: I): IOEither<EnonicError, A> => {
    const decoded: Either<Errors, A> = a.decode(i);

    return pipe(
      decoded,
      fromEither,
      mapLeft(() => (
        {
          ...badRequestError,
          errors: getErrorDetailReporter(params?.i18nPrefix).report(decoded)
        }
      ))
    )
  };
}

export interface ValidateParams {
  readonly i18nPrefix?: string;
}

export interface RegexpValidatedStringProps<A extends boolean = false> {
  readonly regexp: RegExp;
  readonly isNullable?: A;
}

export function RegexpValidatedString<A extends string>(props: RegexpValidatedStringProps): t.Type<A, A, unknown>;
export function RegexpValidatedString<A extends string | undefined>(props: RegexpValidatedStringProps<true>): t.Type<A, A, unknown>;
export function RegexpValidatedString({ regexp, isNullable = false }: RegexpValidatedStringProps<boolean>): t.Type<undefined | string, undefined | string, unknown> {
  return new t.Type<undefined | string, undefined | string, unknown>(
    'RegexpValidatedString',
    (u): u is string | undefined => (typeof u === "string" && regexp.test(u)) || (isNullable && u === undefined),
    (u, c) => {
      return (typeof u === "string" && regexp.test(u)) || (isNullable && u === undefined)
        ? t.success(u)
        : t.failure(u, c);
    },
    t.identity
  )
}

export interface MaxLengthValidatedStringProps<A extends boolean = false> {
  readonly maxLength: number;
  readonly isNullable?: A;
}

export function MaxLengthValidatedString<A extends string>(props: MaxLengthValidatedStringProps): t.Type<A, A, unknown>;
export function MaxLengthValidatedString<A extends string | undefined>(props: MaxLengthValidatedStringProps<true>): t.Type<A, A, unknown>;
export function MaxLengthValidatedString({ maxLength, isNullable = false }: MaxLengthValidatedStringProps<boolean>): t.Type<string | undefined, string | undefined, unknown> {
  return new t.Type<string | undefined, string | undefined, unknown>(
    'MaxLengthValidatedString',
    (u): u is string => (typeof u === "string" && u.length <= maxLength) || (isNullable && u === undefined),
    (u, c) => {
      return (typeof u === "string" && u.length <= maxLength) || (isNullable && u === undefined)
        ? t.success(u)
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

export function MinMaxValidatedNumber<A extends number>(props: MinMaxValidatedNumberProps): t.Type<A, A, unknown>;
export function MinMaxValidatedNumber<A extends number | undefined>(props: MinMaxValidatedNumberProps<true>): t.Type<A, A, unknown>;
export function MinMaxValidatedNumber ({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, isNullable = false }: MinMaxValidatedNumberProps<boolean>): t.Type<number | undefined, number | undefined, unknown> {
  return new t.Type<number | undefined, number | undefined, unknown>(
    'MinMaxValidatedNumber',
    (u): u is number => (t.number.is(u) && (min <= u) && (u <= max)) || (isNullable && u === undefined),
    (u, c) => {
      return (t.number.is(u) && (min <= u) && (u <= max)) || (isNullable && u === undefined)
        ? t.success(u)
        : t.failure(u, c)
    },
    t.identity
  );
}
