import { useCallback, useRef } from "react";

/**
 * 需要得到一个不变的函数引用，但是这个不变的函数执行的时候，执行的是传递的最新的函数
 */
export type noop = (...args: any[]) => any;

export function useCallbackRef<T extends noop>(fn: T): T {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;
  return useCallback(((...args: any[]) => fnRef.current(...args)) as T, []);
}
