'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useState } from 'react';
import WsLogo from '@/components/WsLogo';

type Item = {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  hot?: number;
  iced?: number;
  price?: number;
  description?: string;
  notes?: string;
  tag?: string;
  image?: string;
  active: boolean;
};

type CartLine = {
  id: string;
  name: string;
  variant: string;
  unit: number;
  qty: number;
};

const DISPLAY_PHONE = '051 131 3965';
const WA_NUMBER = '966511313965';
const sar = (n: number) => `⃁ ${n}`;



export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCat, setActiveCat] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [url, setUrl] = useState('');
  const [modalImg, setModalImg] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setUrl(window.location.origin);
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => {
        if (d?.menu) {
          setItems(d.menu.filter((x: Item) => x.active !== false));
        }
      })
      .catch(() => setErr('Could not load menu dynamically. Serving offline selections.'));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.category));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCat === 'All' || item.category === activeCat;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.nameAr && item.nameAr.includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [items, activeCat, search]);

  const groupedItems = useMemo(() => {
    const groups: { [cat: string]: Item[] } = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const total = useMemo(() => cart.reduce((s, x) => s + x.unit * x.qty, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((s, x) => s + x.qty, 0), [cart]);

  function addToCart(item: Item, variant: string, price: number) {
    setCart((old) => {
      const found = old.find((x) => x.id === item.id && x.variant === variant);
      if (found) {
        return old.map((x) => (x === found ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...old, { id: item.id, name: item.name, variant, unit: price, qty: 1 }];
    });
  }

  function changeQty(index: number, delta: number) {
    setCart((old) =>
      old
        .map((x, i) => (i === index ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0)
    );
  }

  const orderText = encodeURIComponent(
    `☕ *New Order from Waseem Cafe Menu*\n\n` +
      cart.map((x) => `• ${x.qty}× ${x.name} (${x.variant}) — ${sar(x.unit * x.qty)}`).join('\n') +
      `\n\n💰 *Total:* ${sar(total)}\n\n_Thank you for ordering with Waseem Cafe!_`
  );

  const handleMascotDblClick = () => {
    window.location.href = '/admin';
  };
  let lastTapTime = 0;
  const handleMascotTouch = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapTime < 400) {
      e.preventDefault();
      window.location.href = '/admin';
    }
    lastTapTime = now;
  };

  return (
    <main className="menu-sheet">
      {/* Brand Header */}
      <header className="brand-hero">
        <div className="brand-badge">
          <span>🌿</span> Specialty Coffee · 100% Arabica
        </div>

        <div className="brand-logo-wrap">
          <div
            className="mascot-badge"
            title="Captain Waseem"
            onDoubleClick={handleMascotDblClick}
            onTouchEnd={handleMascotTouch}
            style={{
              width: 78,
              height: 78,
              borderRadius: '50%',
              border: '2px solid var(--ws-gold)',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/waseem-mascot-bust.png"
              alt="Waseem Mascot"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
            />
          </div>
          <WsLogo size={96} />
        </div>

        <h1 className="brand-title">Waseem Cafe</h1>
        <p className="brand-title-ar">مقهى وسيم</p>
        <p className="brand-slogan">Good Coffee · Better Days</p>
        <div className="brand-divider" />
        <p className="brand-subtext">
          Artisanal pour-over, handcrafted espresso, velvety microfoam, and natural fresh juices prepared with passion.
        </p>

        <div className="quick-action-strip">
          <a href={`tel:+${WA_NUMBER}`} className="quick-btn quick-btn-gold">
            📞 Call {DISPLAY_PHONE}
          </a>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="quick-btn quick-btn-outline"
          >
            💬 WhatsApp Us
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="menu-content">

        {/* Search & Category Filter Controls */}
        <div className="controls-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search drinks, flavor notes (e.g. V60, Latte, Avocado)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search menu"
            />
          </div>

          <div className="category-tabs" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCat === cat}
                className={`cat-pill ${activeCat === cat ? 'active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat === 'All' && '✨ '}
                {cat === 'Specialty Coffee' && '☕ '}
                {cat === 'Espresso & Milk' && '🥛 '}
                {cat === 'Iced & Refreshing' && '🧊 '}
                {cat === 'Tea & Fresh Juices' && '🍃 '}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {err && (
          <p role="alert" style={{ color: '#b91c1c', fontSize: 13, textAlign: 'center' }}>
            {err}
          </p>
        )}

        {/* Grouped Menu Sections */}
        {Object.keys(groupedItems).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <p>No drinks matched your search criteria.</p>
            <button
              onClick={() => {
                setActiveCat('All');
                setSearch('');
              }}
              className="action-btn"
              style={{ margin: '8px auto' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, catItems]) => (
            <section className="menu-group" key={category}>
              <div className="menu-group-header">
                <h2 className="menu-group-title">{category}</h2>
                <div className="menu-group-line" />
              </div>

              <div className="items-grid">
                {catItems.map((item) => (
                  <article className="drink-card" key={item.id}>
                    {/* Item Thumbnail */}
                    <div
                      className="drink-thumb"
                      onClick={() =>
                        item.image &&
                        setModalImg({
                          src: item.image,
                          title: item.name,
                          desc: item.notes || item.description || '',
                        })
                      }
                      title={item.image ? 'Click to view photo' : undefined}
                    >
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.image} alt={item.name} loading="lazy" />
                      ) : (
                        <div className="drink-thumb-fallback">WS</div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="drink-details">
                      <div className="drink-header-row">
                        <div>
                          <h3 className="drink-title">
                            {item.name}
                            {item.nameAr && <span className="drink-title-ar">{item.nameAr}</span>}
                          </h3>
                        </div>
                        {item.tag && <span className="drink-tag">{item.tag}</span>}
                      </div>

                      {item.notes && <p className="drink-notes">✨ {item.notes}</p>}
                      {item.description && <p className="drink-desc">{item.description}</p>}

                      {/* Add Buttons with Pricing */}
                      <div className="drink-actions">
                        {item.hot !== undefined && (
                          <button
                            className="action-btn"
                            onClick={() => addToCart(item, 'Hot', item.hot!)}
                            aria-label={`Add Hot ${item.name}`}
                          >
                            <span className="action-btn-icon">♨️</span>
                            <span>Hot</span>
                            <span className="action-btn-price">{sar(item.hot)}</span>
                            <span>＋</span>
                          </button>
                        )}
                        {item.iced !== undefined && (
                          <button
                            className="action-btn"
                            onClick={() => addToCart(item, 'Iced', item.iced!)}
                            aria-label={`Add Iced ${item.name}`}
                          >
                            <span className="action-btn-icon">🧊</span>
                            <span>Iced</span>
                            <span className="action-btn-price">{sar(item.iced)}</span>
                            <span>＋</span>
                          </button>
                        )}
                        {item.price !== undefined && (
                          <button
                            className="action-btn"
                            onClick={() => addToCart(item, 'Regular', item.price!)}
                            aria-label={`Add ${item.name}`}
                          >
                            <span>Regular</span>
                            <span className="action-btn-price">{sar(item.price)}</span>
                            <span>＋</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}

        {/* Order Cart Drawer / Bar */}
        <section className="cart-floating" aria-label="Customer Order">
          <div className="cart-head">
            <h2>
              <span>🛍️</span> Your Order Draft
            </h2>
            <span className="cart-count-badge">{cartItemCount} items</span>
          </div>

          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>Your order is empty. Tap any drink button above (Hot, Iced, or Regular) to add items.</p>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((line, idx) => (
                    <div className="cart-item-row" key={`${line.id}-${line.variant}`}>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{line.name}</div>
                        <div className="cart-item-variant">
                          {line.variant} · {sar(line.unit)} each
                        </div>
                      </div>

                      <div className="cart-qty-ctrl">
                        <button
                          onClick={() => changeQty(idx, -1)}
                          aria-label={`Decrease quantity of ${line.name}`}
                        >
                          −
                        </button>
                        <span className="cart-qty-num">{line.qty}</span>
                        <button
                          onClick={() => changeQty(idx, 1)}
                          aria-label={`Increase quantity of ${line.name}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-price-sum">{sar(line.unit * line.qty)}</div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="cart-total-row">
                    <span>Total Amount</span>
                    <span>{sar(total)}</span>
                  </div>

                  <a
                    className="order-wa-btn"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://wa.me/${WA_NUMBER}?text=${orderText}`}
                  >
                    <span>💬</span> Send Order via WhatsApp ({sar(total)})
                  </a>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="menu-footer">
        <div className="footer-content">
          <div className="footer-qr-wrap">
            <div className="footer-qr-card">
              {url ? (
                <QRCodeSVG value={url} size={118} level="M" fgColor="#0E382C" includeMargin />
              ) : (
                <div style={{ width: 118, height: 118 }} />
              )}
              <p>Scan to view & share live menu</p>
            </div>
            <div className="footer-mascot-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/waseem-mascot-standing.png"
                alt="Waseem with coffee"
                className="footer-mascot-img"
                onDoubleClick={handleMascotDblClick}
                onTouchEnd={handleMascotTouch}
                style={{ cursor: 'pointer' }}
                title="Captain Waseem"
              />
            </div>
          </div>

          <div className="footer-links">
            <a href={`tel:+${WA_NUMBER}`} className="footer-link">
              📞 {DISPLAY_PHONE}
            </a>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="footer-link">
              💬 WhatsApp
            </a>
          </div>

          <p className="footer-signature">
            Waseem Cafe · Good Coffee · Better Days © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Image Modal Preview */}
      {modalImg && (
        <div
          className="image-modal-backdrop"
          onClick={() => setModalImg(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="image-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-modal-close"
              onClick={() => setModalImg(null)}
              aria-label="Close dialog"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalImg.src} alt={modalImg.title} className="image-modal-img" />
            <div className="image-modal-body">
              <h3 style={{ margin: '0 0 6px', color: '#DFC18B', fontFamily: 'Cinzel, serif' }}>
                {modalImg.title}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#e5ede9', lineHeight: 1.5 }}>
                {modalImg.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
