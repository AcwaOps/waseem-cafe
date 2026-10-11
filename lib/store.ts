import { kv } from '@vercel/kv';
import { initialMenu } from './menu';
export type MenuItem={id:string;name:string;category:string;hot?:number;iced?:number;price?:number;active:boolean};
const KEY='waseem-cafe:menu:v1';
export async function readMenu():Promise<MenuItem[]>{try{const stored=await kv.get<MenuItem[]>(KEY);if(stored?.length)return stored}catch{}return initialMenu}
export async function writeMenu(menu:MenuItem[]){await kv.set(KEY,menu)}
