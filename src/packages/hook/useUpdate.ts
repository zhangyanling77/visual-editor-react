import { useMemo, useState } from 'react';

export function useUpdate() {
  const [count, setCount] = useState(0);
  return useMemo(
    () => ({
      update: () => setCount(count + 1),
    }),
    [count],
  );
}
