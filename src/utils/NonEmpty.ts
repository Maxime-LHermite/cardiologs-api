export type NonEmpty<T> = [T, ...T[]];

export const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
