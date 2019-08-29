import { Error } from "enonic-fp/lib/common";
import { Either, map } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { Content, publish } from "enonic-fp/lib/content";

export function publishFromDraftToMaster(content: Content) : Either<Error, Content> {
  return pipe(
    publish({
      keys: [content._id],
      sourceBranch: 'draft',
      targetBranch: 'master',
    }),
    map(() => content)
  );
}

export function publishContentByKey<T>(key: string) : (t: T) => Either<Error, T> {
  return t => {
    return pipe(
      publish({
        keys: [key],
        sourceBranch: 'draft',
        targetBranch: 'master',
      }),
      map(() => t)
    );
  }
}
