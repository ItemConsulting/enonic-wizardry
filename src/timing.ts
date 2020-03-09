import {pipe} from "fp-ts/lib/pipeable";
import {sequenceT} from "fp-ts/lib/Apply";
import {tupled} from "fp-ts/lib/function";
import {ioEither, IOEither, map, right} from "fp-ts/lib/IOEither";
import {EnonicError} from "enonic-fp/lib/errors";

// https://medium.com/bbc-design-engineering/server-timing-in-the-wild-bfb34816322e
// TODO, Can we take in a tuple with a string with timer info as a parameter, and just extend that string?
// TODO Can we take the `ioEither` as a parameter, and make this polymorfic
// Change key parameter to an object, where we can also disable this.
// Can we build something around the Reader pattern, so that we don't need to pass in parameter, and that the result can be written to the reader?
export function timer<A>(a: IOEither<EnonicError, A>, key: string): IOEither<EnonicError, [A, string]> {
  return pipe(
    sequenceT(ioEither)(
      right<EnonicError, number>(1234),
      a
    ),
    map(tupled((start: number, value: A) => {
      return [value, `${key} & ${start}`];
    }))
  )
}
