import { useInfiniteQuery } from '@tanstack/react-query';
import * as feedApi from '../api/feed.api';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => feedApi.getFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
