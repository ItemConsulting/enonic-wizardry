import {Errors, Type} from 'io-ts';
import {Either} from 'fp-ts/Either'
import {ErrorDetailReporter} from "./reporters/ErrorDetailReporter";
import {badRequestError, EnonicError} from 'enonic-fp/errors';
import {fromEither, IOEither, mapLeft} from "fp-ts/IOEither";
import {pipe} from "fp-ts/pipeable";

export function validate<A, O = A, I = unknown>(a: Type<A, O, I>): (i: I) => IOEither<EnonicError, A> {
  return (i: I): IOEither<EnonicError, A> => {
    const decoded: Either<Errors, A> = a.decode(i);

    return pipe(
      decoded,
      fromEither,
      mapLeft(() => (
        {
          ...badRequestError,
          errors: ErrorDetailReporter.report(decoded)
        }
      ))
    )
  };
}
