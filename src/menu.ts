import { chain, IOEither, right } from "fp-ts/IOEither";
import { GetMenuParams, MenuItem } from "enonic-types/menu";
import { get as getContent } from "enonic-fp/content";
import { getSubMenus } from "enonic-fp/menu";
import { EnonicError } from "enonic-fp/errors";
import { pipe } from "fp-ts/function";

export function getSubMenuByKey(
  levels: number,
  params?: GetMenuParams,
  key?: string
): IOEither<EnonicError, ReadonlyArray<MenuItem>> {
  return key !== undefined
    ? pipe(getContent({ key }), chain(getSubMenus(levels, params)))
    : right([]);
}
