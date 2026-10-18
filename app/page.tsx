'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useState } from 'react';
import WsLogo from '@/components/WsLogo';
import { PaymentSettings, defaultPaymentSettings } from '@/lib/types';

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
  const [storeOpen, setStoreOpen] = useState<boolean>(true);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCat, setActiveCat] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [url, setUrl] = useState('');
  const [modalImg, setModalImg] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [payModal, setPayModal] = useState<{
    type: 'stc' | 'barq';
    number: string;
    name: string;
    note: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setUrl(window.location.origin);
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => {
        if (d?.menu) {
          setItems(d.menu);
        }
        if (typeof d?.storeOpen === 'boolean') {
          setStoreOpen(d.storeOpen);
        }
        if (d?.paymentSettings) {
          setPaymentSettings(d.paymentSettings);
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
    if (!storeOpen) {
      alert('🌙 Waseem Cafe is currently closed. Ordering will reopen soon!');
      return;
    }
    if (item.active === false) return;
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

  function showToast(text: string) {
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), 3500);
  }

  function copyToClipboard(text: string, label: string) {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`📋 ${label} copied! (جاهز للصق)`);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text: string, label: string) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(`📋 ${label} copied! (جاهز للصق)`);
    } catch {
      prompt('Copy this:', text);
    }
  }

  function handleOpenPayment(type: 'stc' | 'barq') {
    if (!storeOpen) {
      alert('🌙 Waseem Cafe is currently closed.');
      return;
    }
    const isStc = type === 'stc';
    const number = isStc ? (paymentSettings.stcNumber || '0511313965') : (paymentSettings.barqNumber || '0511313965');
    const name = isStc ? (paymentSettings.stcName || 'Captain Waseem') : (paymentSettings.barqName || 'Captain Waseem');
    const note = isStc ? paymentSettings.stcNote : paymentSettings.barqNote;

    // Immediately copy transfer number to clipboard
    copyToClipboard(number, `${isStc ? 'STC Bank' : 'Barq Pay'} number (${number})`);

    // Open modal without disruptive automatic window.location redirects
    setPayModal({ type, number, name, note });
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <div className="brand-badge" style={{ marginBottom: 0 }}>
            <span>🌿</span> Specialty Coffee · 100% Arabica
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 14px',
              borderRadius: 30,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: storeOpen ? 'rgba(21, 128, 61, 0.35)' : 'rgba(225, 29, 72, 0.35)',
              border: `1px solid ${storeOpen ? 'rgba(74, 222, 128, 0.5)' : 'rgba(251, 113, 133, 0.6)'}`,
              color: storeOpen ? '#dcfce7' : '#ffe4e6',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: storeOpen ? '#4ade80' : '#fb7185',
                boxShadow: `0 0 8px ${storeOpen ? '#4ade80' : '#fb7185'}`,
              }}
            />
            <span>{storeOpen ? 'Open Now · مفتوح الآن' : 'Currently Closed · مغلق حالياً'}</span>
          </div>
        </div>

        <div className="brand-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/waseem-mascot-bust.png"
            alt="Captain Waseem Mascot"
            title="Captain Waseem"
            onDoubleClick={handleMascotDblClick}
            onTouchEnd={handleMascotTouch}
            style={{
              height: 118,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4))',
              cursor: 'pointer',
            }}
          />
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
        {/* Store Closed Banner */}
        {!storeOpen && (
          <div
            role="alert"
            style={{
              background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
              border: '1.5px solid #fda4af',
              borderLeft: '6px solid #e11d48',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 22,
              boxShadow: '0 6px 20px rgba(225, 29, 72, 0.08)',
            }}
          >
            <h3
              style={{
                margin: '0 0 4px',
                fontSize: 16,
                fontWeight: 800,
                color: '#9f1239',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>🌙 Waseem Cafe is Currently Closed</span>
              <span dir="rtl">مقهى وسيم مغلق حالياً</span>
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#881337', lineHeight: 1.45 }}>
              We are currently outside operating hours or taking a short break. Feel free to explore our specialty menu below — online ordering will resume as soon as we reopen!
            </p>
          </div>
        )}

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
                {cat === 'Desserts & Bakery' && '🥐 '}
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
                  <article
                    className="drink-card"
                    key={item.id}
                    style={!item.active ? { opacity: 0.65, background: '#fcfbf9' } : undefined}
                  >
                    {/* Item Thumbnail */}
                    <div
                      className="drink-thumb"
                      onClick={() =>
                        item.image &&
                        setModalImg({
                          src: item.image,
                          title: item.name + (item.nameAr ? ` · ${item.nameAr}` : ''),
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
                      {!item.active ? (
                        <div style={{ marginTop: 8 }}>
                          <span
                            style={{
                              background: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ⛔ Sold Out (نفدت الكمية)
                          </span>
                        </div>
                      ) : (
                        <div className="drink-actions">
                          {item.hot !== undefined && (
                            <button
                              className="action-btn"
                              onClick={() => addToCart(item, 'Hot', item.hot!)}
                              aria-label={`Add Hot ${item.name}`}
                              style={!storeOpen ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
                            >
                              <span className="action-btn-icon">♨️</span>
                              <span>Hot</span>
                              <span className="action-btn-price">{sar(item.hot)}</span>
                              <span>{storeOpen ? '＋' : '🌙'}</span>
                            </button>
                          )}
                          {item.iced !== undefined && (
                            <button
                              className="action-btn"
                              onClick={() => addToCart(item, 'Iced', item.iced!)}
                              aria-label={`Add Iced ${item.name}`}
                              style={!storeOpen ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
                            >
                              <span className="action-btn-icon">🧊</span>
                              <span>Iced</span>
                              <span className="action-btn-price">{sar(item.iced)}</span>
                              <span>{storeOpen ? '＋' : '🌙'}</span>
                            </button>
                          )}
                          {item.price !== undefined && (
                            <button
                              className="action-btn"
                              onClick={() => addToCart(item, 'Regular', item.price!)}
                              aria-label={`Add ${item.name}`}
                              style={!storeOpen ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
                            >
                              <span>Regular</span>
                              <span className="action-btn-price">{sar(item.price)}</span>
                              <span>{storeOpen ? '＋' : '🌙'}</span>
                            </button>
                          )}
                        </div>
                      )}
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
                <p>
                  {storeOpen
                    ? 'Your order is empty. Tap any drink button above (Hot, Iced, or Regular) to add items.'
                    : '🌙 Cafe is currently closed for online orders.'}
                </p>
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

                  {storeOpen ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <a
                        className="order-wa-btn"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/${WA_NUMBER}?text=${orderText}`}
                      >
                        <span>💬</span> Send Order via WhatsApp ({sar(total)})
                      </a>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {paymentSettings.stcEnabled && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment('stc')}
                            style={{
                              flex: 1,
                              minWidth: 160,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              background: 'linear-gradient(135deg, #4f008c 0%, #35005e 100%)',
                              color: '#fff',
                              border: '1px solid #7928ca',
                              padding: '12px 14px',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(79, 0, 140, 0.25)',
                            }}
                          >
                            <span>🟣</span> Pay via STC Bank ({sar(total)})
                          </button>
                        )}

                        {paymentSettings.barqEnabled && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment('barq')}
                            style={{
                              flex: 1,
                              minWidth: 160,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: '#1c1917',
                              border: '1px solid #fbbf24',
                              padding: '12px 14px',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                            }}
                          >
                            <span>⚡</span> Pay via Barq Pay ({sar(total)})
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="order-wa-btn"
                      style={{ background: '#94a3b8', cursor: 'not-allowed', pointerEvents: 'none' }}
                    >
                      <span>🌙</span> Cafe Currently Closed — Ordering Paused
                    </div>
                  )}
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

      {/* STC Bank & Barq Pay Transfer Dialog */}
      {payModal && (
        <div
          onClick={() => setPayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,38,31,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440,
              width: '100%',
              background: '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              border: '2px solid var(--ws-gold)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                padding: '18px 20px',
                color: '#fff',
                background:
                  payModal.type === 'stc'
                    ? 'linear-gradient(135deg, #4f008c, #35005e)'
                    : 'linear-gradient(135deg, #d97706, #b45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{payModal.type === 'stc' ? '🟣' : '⚡'}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>
                    {payModal.type === 'stc' ? 'STC Bank Quick Transfer' : 'Barq Pay (بارق) Transfer'}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.85)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Digital Instant Checkout
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayModal(null)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20 }}>
              {/* Copy Confirmation Banner */}
              <div
                style={{
                  background: '#dcfce7',
                  border: '1.5px solid #4ade80',
                  color: '#14532d',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <div>تم نسخ الرقم تلقائياً إلى الحافظة!</div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>
                    Number copied! Open app & paste to transfer
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#faf8f5',
                  border: '1px solid var(--ws-line)',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Transfer To (Mobile / Account)
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ws-emerald-deep)' }}>
                      {payModal.number}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(payModal.number, 'Mobile number')}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--ws-gold-dark)',
                      color: 'var(--ws-emerald-deep)',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📋 Copy Number
                  </button>
                </div>

                <div style={{ paddingTop: 10, borderTop: '1px dashed var(--ws-line)', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Beneficiary Name
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ws-text-main)' }}>
                    {payModal.name}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px dashed var(--ws-line)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ws-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Exact Purchase Amount
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ws-emerald)' }}>
                      {sar(total)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(total), 'Purchase amount')}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--ws-gold-dark)',
                      color: 'var(--ws-emerald-deep)',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📋 Copy Amount
                  </button>
                </div>
              </div>

              {/* Step Instructions */}
              <div
                style={{
                  background: '#faf8f5',
                  border: '1px solid var(--ws-line)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 12,
                  fontSize: 12,
                  color: 'var(--ws-text-main)',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--ws-emerald)', marginBottom: 4 }}>
                  📌 خطوات التحويل السريعة:
                </div>
                <div>1️⃣ <b>الرقم منسوخ:</b> الصق الرقم <code style={{ background: '#e2ece7', padding: '1px 5px', borderRadius: 4, color: '#0e382c', fontWeight: 700 }}>{payModal.number}</code> في تطبيقك.</div>
                <div>2️⃣ <b>تحويل المبلغ:</b> حوّل المبلغ المحدد (<b style={{ color: '#0e382c' }}>{sar(total)}</b>).</div>
                <div>3️⃣ <b>إرسال الإشعار:</b> اضغط الزر الأخضر أدناه لتأكيد الطلب وتجهيزه فوراً عبر واتساب.</div>
              </div>

              <div
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: 10,
                  padding: '9px 12px',
                  fontSize: 12,
                  color: '#854d0e',
                  marginBottom: 14,
                  lineHeight: 1.4,
                }}
              >
                {payModal.note ||
                  (payModal.type === 'stc'
                    ? 'Please open your STC Bank / STC Pay app, paste the copied mobile number, and transfer the order amount.'
                    : 'Please open your Barq app, paste the copied mobile number, and transfer the order amount.')}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (payModal.type === 'stc') {
                    window.location.href = 'stcpay://';
                  } else {
                    window.location.href = 'barq://';
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: 10,
                  color: '#fff',
                  background: payModal.type === 'stc' ? '#4f008c' : '#d97706',
                }}
              >
                <span>{payModal.type === 'stc' ? '🚀 Open STC Pay / STC Bank App' : '⚡ Open Barq App'}</span>
              </button>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                  `☕ *Payment Confirmation & Order Draft*\n\n` +
                    `👤 *Customer Order from Waseem Cafe Menu*\n\n` +
                    cart.map((x) => `• ${x.qty}× ${x.name} (${x.variant}) — ${sar(x.unit * x.qty)}`).join('\n') +
                    `\n\n💰 *Total Amount:* ${sar(total)}\n` +
                    `💳 *Payment Method:* ${payModal.type === 'stc' ? '🟣 STC Bank Transfer' : '⚡ Barq Pay Transfer'}\n` +
                    `📲 *Sent To:* ${payModal.number} (${payModal.name})\n\n` +
                    `_I have sent the transfer via ${payModal.type === 'stc' ? 'STC Bank' : 'Barq'}. Please prepare my order!_`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  background: '#25d366',
                  color: '#fff',
                  padding: 11,
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <span>💬</span> Send Transfer Proof & Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--ws-emerald-deep)',
            color: '#fff',
            border: '1px solid var(--ws-gold)',
            padding: '10px 18px',
            borderRadius: 24,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
            zIndex: 1100,
            whiteSpace: 'nowrap',
          }}
        >
          {toastMsg}
        </div>
      )}
    </main>
  );
}
