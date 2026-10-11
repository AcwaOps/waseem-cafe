'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useState } from 'react';

type Item = { id: string; name: string; category: string; hot?: number; iced?: number; price?: number; active: boolean };
type CartLine = { id: string; name: string; variant: string; unit: number; qty: number };
const displayPhone = '051 131 3965';
const waNumber = '966511313965';
const sar = (n: number) => `⃁ ${n}`;

export default function Home() {
 const [items,setItems]=useState<Item[]>([]); const [cart,setCart]=useState<CartLine[]>([]); const [url,setUrl]=useState(''); const [err,setErr]=useState('');
 useEffect(()=>{setUrl(window.location.origin);fetch('/api/menu').then(r=>r.json()).then(d=>setItems(d.menu.filter((x:Item)=>x.active!==false))).catch(()=>setErr('Could not load the menu. Please call us.'));},[]);
 const total=useMemo(()=>cart.reduce((s,x)=>s+x.unit*x.qty,0),[cart]);
 function add(item:Item,variant:string,price:number){setCart(old=>{const found=old.find(x=>x.id===item.id&&x.variant===variant);return found?old.map(x=>x===found?{...x,qty:x.qty+1}:x):[...old,{id:item.id,name:item.name,variant,unit:price,qty:1}]})}
 function change(i:number,delta:number){setCart(old=>old.map((x,n)=>n===i?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0))}
 const orderText=encodeURIComponent(`Hello Waseem Cafe! I'd like to order:\n${cart.map(x=>`• ${x.qty} × ${x.name} (${x.variant}) — ${sar(x.unit*x.qty)}`).join('\n')}\n\nTotal: ${sar(total)}`);
 return <main className="menu-sheet">
  <header className="brand"><div className="mascot-placeholder" aria-label="Mascot artwork placeholder">W</div><p className="eyebrow">COFFEE · TEA · JUICE</p><h1>Waseem Cafe</h1><p className="tagline">Made with care, served with a smile.</p></header>
  {err&&<p role="alert">{err}</p>}
  {['Coffee','Tea & Juice'].map(category=><section className="menu-section" key={category}><h2>{category}</h2>{items.filter(x=>x.category===category).map(item=><article className="drink" key={item.id}><div className="cup-icon" aria-hidden="true">W</div><div className="drink-info"><h3>{item.name}</h3><div className="order-options">{item.hot!==undefined&&<button onClick={()=>add(item,'Hot',item.hot)}>Hot {sar(item.hot)} <span>＋</span></button>}{item.iced!==undefined&&<button onClick={()=>add(item,'Iced',item.iced)}>Iced {sar(item.iced)} <span>＋</span></button>}{item.price!==undefined&&<button onClick={()=>add(item,'Regular',item.price)}>{sar(item.price)} <span>＋</span></button>}</div></div></article>)}</section>)}
  <section className="cart"><h2>Your order <span>({cart.reduce((s,x)=>s+x.qty,0)})</span></h2>{cart.length===0?<p>Tap a drink option to add it to your order.</p>:<>{cart.map((x,i)=><div className="cart-row" key={`${x.id}-${x.variant}`}><span>{x.qty} × {x.name} ({x.variant})</span><span>{sar(x.unit*x.qty)}</span><span className="qty-controls"><button aria-label="Decrease quantity" onClick={()=>change(i,-1)}>−</button><button aria-label="Increase quantity" onClick={()=>change(i,1)}>＋</button></span></div>)}<div className="cart-total"><strong>Total</strong><strong>{sar(total)}</strong></div><a className="order-button" target="_blank" rel="noreferrer" href={`https://wa.me/${waNumber}?text=${orderText}`}>Order on WhatsApp</a></>}</section>
  <footer className="footer"><div className="qr-area">{url&&<QRCodeSVG value={url} size={112} level="M" includeMargin/>}<p>Scan to view our menu</p></div><div className="contact"><a href={`tel:+${waNumber}`} className="call-button">Call Waseem · {displayPhone}</a><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer">Message on WhatsApp</a><a href="/admin/login">Admin</a></div></footer><p className="print-note">Waseem Cafe · Thank you for visiting</p>
 </main>;
}
