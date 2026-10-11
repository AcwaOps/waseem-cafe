'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

type Drink = { name: string; hot?: number; iced?: number; price?: number; category: 'Coffee' | 'Tea & Juice' };
const drinks: Drink[] = [
  { name: 'Latte', hot: 5, iced: 8, category: 'Coffee' },
  { name: 'Cappuccino', hot: 5, iced: 8, category: 'Coffee' },
  { name: 'Mocha', hot: 5, iced: 8, category: 'Coffee' },
  { name: 'Americano', hot: 5, iced: 10, category: 'Coffee' },
  { name: 'V60', price: 10, category: 'Coffee' },
  { name: 'Karak Tea', hot: 3, category: 'Tea & Juice' },
  { name: 'Fresh Juice', price: 5, category: 'Tea & Juice' },
];
const phoneDisplay = '051 131 3965';
const whatsapp = '966511313965';

function Price({ amount }: { amount: number }) { return <span className="price"><span aria-label="Saudi riyal">⃁</span> {amount}</span>; }

export default function Home() {
  const [menuUrl, setMenuUrl] = useState('');
  useEffect(() => { setMenuUrl(window.location.origin); }, []);
  return (
    <main className="menu-sheet">
      <header className="brand">
        <div className="mascot-placeholder" aria-label="Mascot artwork placeholder"><span>W</span></div>
        <p className="eyebrow">COFFEE · TEA · JUICE</p>
        <h1>Waseem Cafe</h1>
        <p className="tagline">Made with care, served with a smile.</p>
      </header>
      {(['Coffee', 'Tea & Juice'] as const).map(category => (
        <section className="menu-section" key={category}>
          <h2>{category}</h2>
          {drinks.filter(d => d.category === category).map(drink => (
            <article className="drink" key={drink.name}>
              <div className="cup-icon" aria-hidden="true"><span>W</span></div>
              <div className="drink-info">
                <h3>{drink.name}</h3>
                <p>{drink.hot !== undefined && <>Hot <Price amount={drink.hot} /></>}{drink.hot !== undefined && drink.iced !== undefined && <span className="separator"> · </span>}{drink.iced !== undefined && <>Iced <Price amount={drink.iced} /></>}{drink.price !== undefined && <Price amount={drink.price} />}</p>
              </div>
            </article>
          ))}
        </section>
      ))}
      <footer className="footer">
        <div className="serve-mascot" aria-hidden="true"><span>W</span><span className="offered-cup">☕</span></div>
        <div className="qr-area">
          {menuUrl ? <QRCodeSVG value={menuUrl} size={112} level="M" includeMargin /> : <div className="qr-pending">QR appears after page loads</div>}
          <p>Scan to view our menu</p>
        </div>
        <a className="phone" href={`https://wa.me/${whatsapp}`} aria-label={`WhatsApp ${phoneDisplay}`}>
          <span>WhatsApp / Call</span><strong>{phoneDisplay}</strong>
        </a>
      </footer>
      <p className="print-note">Waseem Cafe · Thank you for visiting</p>
    </main>
  );
}
