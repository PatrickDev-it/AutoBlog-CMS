import { Post } from './post';

export type Group<T = Post> = { id: string; name: string; sub_groups: SubGroup<T>[] };
export type SubGroup<T = Post> = { id: string; name: string; items: T[] };
