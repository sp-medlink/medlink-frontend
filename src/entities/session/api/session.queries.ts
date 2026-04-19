import { queryOptions } from "@tanstack/react-query";
import { fetchMe } from "./me.api";
import { sessionKeys } from "./session.keys";

export const meQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.me(),
    queryFn: fetchMe,
    staleTime: 5 * 60_000,
  });
