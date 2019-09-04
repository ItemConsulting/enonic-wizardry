import { Error } from "enonic-fp/lib/common";
import { Either, map, chain } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import {
  Content,
  publish,
  ModifyContentParams,
  create,
  CreateContentParams,
  DeleteContentParams,
  remove,
  modify
} from "enonic-fp/lib/content";
import {runInDraftContext} from './context';

export function publishFromDraftToMaster<A>(content: Content<A>) : Either<Error, Content<A>> {
  return pipe(
    publish({
      keys: [content._id],
      sourceBranch: 'draft',
      targetBranch: 'master',
    }),
    map(() => content)
  );
}

export function publishContentByKey<A>(key: string) : (a: A) => Either<Error, A> {
  return a => {
    return pipe(
      publish({
        keys: [key],
        sourceBranch: 'draft',
        targetBranch: 'master',
      }),
      map(() => a)
    );
  }
}

export function applyChangesToData<A>(key: string, changes: any) : ModifyContentParams<A> {
  return {
    key,
    editor: (content: Content<A>) => {
      content.data = {
        ...content.data,
        ...changes
      };

      return content;
    },
    requireValid: true
  };
}

export function createAndPublish<A>(params: CreateContentParams<A>) : Either<Error, Content<A>> {
  return pipe(
    runInDraftContext(create)(params),
    chain(publishFromDraftToMaster)
  );
}

export function deleteAndPublish(params: DeleteContentParams) : Either<Error, boolean> {
  return pipe(
    runInDraftContext(remove)(params),
    chain(publishContentByKey(params.key))
  );
}

export function modifyAndPublish<A>(key: string, changes: any) : Either<Error, Content<A>> {
  return pipe(
    runInDraftContext(modify)(applyChangesToData<A>(key, changes)),
    chain(publishFromDraftToMaster)
  );
}
