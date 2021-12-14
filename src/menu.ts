import { chain, IOEither, right } from "fp-ts/es6/IOEither";
import type { GetMenuParams, MenuItem } from "/lib/menu";
import { get as getContent } from "enonic-fp/content";
import { getSubMenus } from "enonic-fp/menu";
import type { EnonicError } from "enonic-fp/errors";
import { pipe } from "fp-ts/es6/function";

export function getSubMenuByKey(
  levels: number,
  params?: GetMenuParams,
  key?: string
): IOEither<EnonicError, ReadonlyArray<MenuItem>> {
  return key !== undefined
    ? pipe(getContent({ key }), chain(getSubMenus(levels, params)))
    : right([]);
}
