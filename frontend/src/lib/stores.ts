// src/lib/stores.ts
import { writable } from 'svelte/store';

// This will hold our array of posts
export const posts = writable([]);