import {chain, IOEither, right} from "fp-ts/lib/IOEither";
import {MenuItem} from "enonic-types/lib/menu";
import {get as getContent} from "enonic-fp/lib/content";
import {getSubMenus} from "enonic-fp/lib/menu";
import {EnonicError} from "enonic-fp/lib/errors";

export function getSubMenuByKey(levels: number, key?: string): IOEither<EnonicError, ReadonlyArray<MenuItem>> {
  return key
    ? chain(
      getSubMenus(levels)
    )(getContent({ key }))
    : right([]);
}
