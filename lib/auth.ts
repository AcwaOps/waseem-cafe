import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
export async function requireAdmin(){const token=(await cookies()).get('waseem_admin')?.value;const secret=process.env.SESSION_SECRET;if(!token||!secret)return false;try{const {payload}=await jwtVerify(token,new TextEncoder().encode(secret));return payload.role==='admin'}catch{return false}}
