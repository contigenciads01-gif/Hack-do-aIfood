import type { Values } from './metaprompt';
export type Material={id:string;tool:string;template:string;title:string;date:string;text:string;original:string;summary:string[]};
export function readLocal<T>(key:string,fallback:T):T {try{return JSON.parse(localStorage.getItem(key)||'null') ?? fallback;}catch{return fallback;}}
export function writeLocal(key:string,value:unknown) {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export type Draft={values:Values;template:string;text:string;original:string;summary:string[];image:string};
