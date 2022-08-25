export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export const jsons = (obj: any) => JSON.stringify(obj, undefined, 2);
