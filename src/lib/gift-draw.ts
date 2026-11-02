/** Picks a random index from `options` (crypto-backed). Every draw wins one of the options. */
export function drawIndex(options: number[]): number {
  return options[crypto.getRandomValues(new Uint32Array(1))[0] % options.length];
}

/** Draws two different gift indexes out of `count`, skipping any already won. */
export function drawTwo(count: number, exclude: number[] = []): [number, number] {
  const pool = Array.from({ length: count }, (_, i) => i).filter((i) => !exclude.includes(i));
  const a = drawIndex(pool);
  const b = drawIndex(pool.filter((i) => i !== a));
  return [a, b];
}
