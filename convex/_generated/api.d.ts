/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as schema from "../schema";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  schema: typeof schema;
}>;
export type Mounts = {};

export declare const api: FilterApi<
  typeof fullApi,
  Mounts
>;
export declare const internal: FilterApi<
  typeof fullApi,
  Mounts
>;
