import { EnonicError } from "enonic-fp/lib/errors";
import {IOEither, map, chain, ioEither} from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import {
  publish,
  create,
  remove,
  modify,
  createMedia
} from "enonic-fp/lib/content";
import { runInDraftContext } from './context';
import { getMultipartItem, getMultipartStream } from "enonic-fp/lib/portal";
import { sequenceT } from "fp-ts/lib/Apply";
import {Content, CreateContentParams, DeleteContentParams, ModifyContentParams} from "enonic-types/lib/content";

export type WithId<T> = T & { _id: string }

export interface CreateMediaFromAttachmentParams {
  /**
   * Name of the field in the form
   */
  readonly name: string;

  /**
   * Parent path to store the media in Enonic
   */
  readonly parentPath: string;

  /**
   * Index in the form, if there are multiple fields with the same name
   */
  readonly index?: number;

  /**
   * Error message for if the form field is not found
   */
  readonly errorMessage?: string;
}

export function publishFromDraftToMaster<A>(content: Content<A>): IOEither<EnonicError, Content<A>> {
  return pipe(
    publish({
      keys: [content._id],
      sourceBranch: 'draft',
      targetBranch: 'master',
    }),
    map(() => content)
  );
}

export function publishContentByKey<A>(key: string): (a: A) => IOEither<EnonicError, A> {
  return (a): IOEither<EnonicError, A> => {
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

export function applyChangesToData<A>(key: string, changes: Partial<A>): ModifyContentParams<A> {
  return {
    key,
    editor: (content: Content<A>): Content<A> => (
      {
        ...content,
        data: {
          ...content.data,
          ...changes
        }
      }
    ),
    requireValid: true
  };
}

export function createAndPublish<A>(params: CreateContentParams<A>): IOEither<EnonicError, Content<A>> {
  return pipe(
    runInDraftContext(create(params)),
    chain(publishFromDraftToMaster)
  );
}

export function deleteAndPublish(params: DeleteContentParams): IOEither<EnonicError, void> {
  return pipe(
    runInDraftContext(remove(params)),
    chain(publishContentByKey(params.key))
  );
}

export function modifyAndPublish<A>(key: string, changes: Partial<A>): IOEither<EnonicError, Content<A>> {
  return pipe(
    runInDraftContext(modify(applyChangesToData<A>(key, changes))),
    chain(publishFromDraftToMaster)
  );
}

export function getContentDataWithId<A>(content: Content<A>): WithId<A> {
  return {
    ...content.data,
    _id: content._id
  };
}

export function createMediaFromAttachment<A>(params: CreateMediaFromAttachmentParams): IOEither<EnonicError, Content<A>> {
  return pipe(
    sequenceT(ioEither)(
      getMultipartStream(params.name, params.index, params.errorMessage),
      getMultipartItem(params.name, params.index, params.errorMessage)
    ),
    chain(([data, item]) =>
      createMedia(
        {
          data,
          parentPath: params.parentPath,
          name: item.fileName,
          mimeType: item.contentType
        }
      )
    )
  );
}
