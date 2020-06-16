import {EnonicError} from "enonic-fp/lib/errors";
import {chain, filterOrElse, ioEither, IOEither, map} from "fp-ts/lib/IOEither";
import {pipe} from "fp-ts/lib/pipeable";
import {create, createMedia, modify, publish, remove} from "enonic-fp/lib/content";
import {runInDraftContext} from './context';
import {getMultipartItem, getMultipartStream} from "enonic-fp/lib/portal";
import {sequenceS} from "fp-ts/lib/Apply";
import {
  ByteSource,
  Content,
  CreateContentParams,
  DeleteContentParams,
  ModifyContentParams
} from "enonic-types/lib/content";
import {MultipartItem} from "enonic-types/lib/portal";
import {identity} from "fp-ts/lib/function";
import {array} from "fp-ts/lib/Array";
import {Separated} from "fp-ts/lib/Compactable";
import {IO, io} from "fp-ts/lib/IO";

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

export function publishFromDraftToMaster<A extends object>(content: Content<A>): IOEither<EnonicError, Content<A>> {
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
  return (a: A): IOEither<EnonicError, A> => {
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

export function applyChangesToData<A extends object>(key: string, changes: Partial<A>): ModifyContentParams<A> {
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

export function createAll<A extends object>(paramsList: Array<CreateContentParams<A>>): IO<Separated<Array<EnonicError>, Array<Content<A>>>> {
  return array.wilt(io)(
    paramsList.map(create),
    identity
  );
}

export function createAndPublish<A extends object>(params: CreateContentParams<A>): IOEither<EnonicError, Content<A>> {
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

export function modifyAndPublish<A extends object>(a: Partial<A>, key: string): IOEither<EnonicError, Content<A>> {
  return pipe(
    runInDraftContext(modify(applyChangesToData<A>(key, a))),
    chain(publishFromDraftToMaster)
  );
}

export function createMediaFromAttachment<A extends object>(params: CreateMediaFromAttachmentParams): IOEither<EnonicError, Content<A>> {
  return pipe(
    sequenceS(ioEither)({
      data: getMultipartStream(params.name, params.index),
      item: getMultipartItem(params.name, params.index)
    }),
    filterOrElse(
      hasDataAndItem,
      () => ({
        errorKey: "BadRequestError",
        errors: {
          [params.name]: [params.errorMessage]
        }
      } as EnonicError)
    ),
    chain(({data, item}: AttachmentDataAndItem) =>
      createMedia(
        {
          data,
          parentPath: params.parentPath,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          name: item.fileName!, // Handled by predicate above
          mimeType: item?.contentType
        }
      )
    )
  );
}

function hasDataAndItem(attachment: Partial<AttachmentDataAndItem>): attachment is AttachmentDataAndItem {
  return (attachment.data !== undefined) && ((attachment.item?.fileName?.length ?? 0) > 0);
}

interface AttachmentDataAndItem {
  readonly data: ByteSource;
  readonly item: MultipartItem;
}
