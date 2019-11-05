import { Type, Errors } from 'io-ts';
import { Either } from 'fp-ts/lib/Either'
import { ObjectReporter } from "./reporters/ObjectReporter";
import { EnonicError } from 'enonic-fp/lib/errors';
import { IOEither, fromEither, mapLeft } from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";

export function validate<A, O = A, I = unknown>(a: Type<A, O, I>): (i: I) => IOEither<EnonicError, A> {
  return (i: I): IOEither<EnonicError, A> => {
    const decoded: Either<Errors, A> = a.decode(i);

    return pipe(
      decoded,
      fromEither,
      mapLeft(() => (
        {
          errorKey: "BadRequestError",
          errors: ObjectReporter.report(decoded)
        }
      ))
    )
  };
}
