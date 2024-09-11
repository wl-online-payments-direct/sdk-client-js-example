/**
 * Add a custom error message when promise is rejected
 *
 * @example:
 * ```ts
 * const promise = Promise.reject(new Error('foo');
 * const res = await promiseWithError(() => promise, 'bar'); // rejected with `new Error('bar')`
 * ```
 */
export async function promiseWithError<Fn extends () => Promise<unknown>>(
  fn: Fn,
  message: string,
) {
  try {
    return (await fn()) as ReturnType<Fn>;
  } catch (err) {
    throw new Error(message);
  }
}
