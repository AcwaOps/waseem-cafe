'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import type { MenuItem } from '@/lib/store';

const CATEGORIES = [
  'Specialty Coffee',
  'Espresso & Milk',
  'Iced & Refreshing',
  'Tea & Fresh Juices',
  'Desserts & Bakery',
];

type Ingredient = {
  id: string;
  name: string;
  nameEn: string;
  qty: number;
  unit: string;
  min: number;
  max: number;
  category: string;
};

type OrderRecord = {
  id: string;
  time: string;
  items: string;
  method: string;
  total: number;
  status: string;
};

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: 'beans-colombia', name: 'Colombian Huila Specialty Beans', nameEn: 'Single Origin 100% Arabica', qty: 14.5, unit: 'kg', min: 4.0, max: 20.0, category: 'Coffee Beans' },
  { id: 'beans-ethiopia', name: 'Ethiopian Guji Natural Beans', nameEn: 'Single Origin 100% Arabica', qty: 8.0, unit: 'kg', min: 3.5, max: 15.0, category: 'Coffee Beans' },
  { id: 'milk-whole', name: 'Fresh Whole Dairy Milk', nameEn: 'Almarai / Nadec Fresh', qty: 24, unit: 'Liters', min: 10, max: 40, category: 'Dairy' },
  { id: 'milk-oat', name: 'Oat Milk Barista Edition', nameEn: 'Plant-Based Barista Blend', qty: 3, unit: 'Liters', min: 6, max: 20, category: 'Dairy' },
  { id: 'avocado-fresh', name: 'Fresh Hass Avocados', nameEn: 'Selected Premium Fruit', qty: 12, unit: 'kg', min: 4, max: 20, category: 'Produce' },
  { id: 'oranges-valencia', name: 'Fresh Valencia Oranges', nameEn: 'Cold Press Juice Fruit', qty: 28, unit: 'kg', min: 8, max: 40, category: 'Produce' },
  { id: 'karak-tea-blend', name: 'Traditional Karak Spiced Tea', nameEn: 'Assam Tea & Cardamom', qty: 5.5, unit: 'kg', min: 2.0, max: 10.0, category: 'Tea & Herbs' },
  { id: 'hibiscus-flowers', name: 'Natural Hibiscus Flowers', nameEn: 'Aswan Sun-Dried Flowers', qty: 4.0, unit: 'kg', min: 1.5, max: 8.0, category: 'Tea & Herbs' },
  { id: 'condensed-milk', name: 'Sweetened Condensed Milk', nameEn: 'Spanish Latte Blend', qty: 18, unit: 'Cans', min: 8, max: 36, category: 'Syrups' },
  { id: 'v60-filters', name: 'Hario V60 Paper Filters 02', nameEn: 'Bleached Cone Filters', qty: 2, unit: 'Packs (100 pcs)', min: 5, max: 20, category: 'Supplies' },
  { id: 'cups-hot', name: 'Waseem Custom Hot Cups', nameEn: '8oz & 12oz Sleeves', qty: 350, unit: 'Cups', min: 100, max: 1000, category: 'Packaging' },
  { id: 'cups-iced', name: 'Clear Iced Cups 16oz', nameEn: 'Crystal Cold Drink Cups', qty: 280, unit: 'Cups', min: 80, max: 800, category: 'Packaging' },
  { id: 'bags-takeaway', name: 'Waseem Custom Takeaway Bags', nameEn: 'Embossed Paper Bags', qty: 190, unit: 'Bags', min: 50, max: 500, category: 'Packaging' },
];

const DEFAULT_ORDERS: OrderRecord[] = [];

const BLANK_ITEM = {
  id: '',
  name: '',
  nameAr: '',
  category: 'Specialty Coffee',
  hot: '',
  iced: '',
  price: '',
  description: '',
  notes: '',
  tag: '',
  image: '',
  active: true,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'pos' | 'menu' | 'zreport'>('analytics');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [storeOpen, setStoreOpen] = useState<boolean>(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [orders, setOrders] = useState<OrderRecord[]>(DEFAULT_ORDERS);
  const [form, setForm] = useState<any>(BLANK_ITEM);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posCart, setPosCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [posMethod, setPosMethod] = useState('Mada');
  const [timeStr, setTimeStr] = useState('');

  // Passcode modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Clock
  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: true }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Local storage for ingredients and orders
  useEffect(() => {
    try {
      const savedIng = localStorage.getItem('waseem_next_ingredients');
      if (savedIng) setIngredients(JSON.parse(savedIng));
      const savedOrd = localStorage.getItem('waseem_next_orders');
      if (savedOrd) setOrders(JSON.parse(savedOrd));
    } catch {}
  }, []);

  function saveIngredients(newIng: Ingredient[]) {
    setIngredients(newIng);
    try {
      localStorage.setItem('waseem_next_ingredients', JSON.stringify(newIng));
    } catch {}
  }

  function saveOrders(newOrd: OrderRecord[]) {
    setOrders(newOrd);
    try {
      localStorage.setItem('waseem_next_orders', JSON.stringify(newOrd));
    } catch {}
  }

  async function loadMenu() {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      if (data?.menu) setItems(data.menu);
      if (typeof data?.storeOpen === 'boolean') setStoreOpen(data.storeOpen);
    } catch {
      setMsg({ text: 'Error connecting to menu service', error: true });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function handleToggleStoreOpen() {
    const nextOpen = !storeOpen;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeOpen: nextOpen }),
      });
      if (res.ok) {
        setStoreOpen(nextOpen);
        setMsg({
          text: nextOpen
            ? '🟢 Store is now OPEN on the Customer Menu!'
            : '🔴 Store is now CLOSED on the Customer Menu!',
        });
      } else {
        setMsg({ text: 'Unauthorized or failed to toggle store status', error: true });
      }
    } catch {
      setMsg({ text: 'Network error toggling store status', error: true });
    }
  }

  async function handleChangePasscode(e: FormEvent) {
    e.preventDefault();
    if (newPin.trim() !== confirmPin.trim()) {
      setMsg({ text: 'New passcode and confirmation do not match', error: true });
      return;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: currentPin.trim(),
          newPasscode: newPin.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinModalOpen(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setMsg({ text: '🔑 Manager Passcode updated successfully!' });
      } else {
        setMsg({ text: data.error || 'Failed to update passcode', error: true });
      }
    } catch {
      setMsg({ text: 'Error updating passcode', error: true });
    }
  }

  function handlePhotoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMsg({ text: 'Please select a valid image file (JPG, PNG, WEBP)', error: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const TARGET = 600;
        const canvas = document.createElement('canvas');
        canvas.width = TARGET;
        canvas.height = TARGET;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#0e382c';
        ctx.fillRect(0, 0, TARGET, TARGET);

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET, TARGET);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
        setForm((prev: any) => ({ ...prev, image: dataUrl }));
        setMsg({ text: '📸 Photo optimized & ready to save!' });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Stock adjustments
  function adjustStock(id: string, delta: number) {
    const updated = ingredients.map((ing) => {
      if (ing.id === id) {
        return { ...ing, qty: Math.max(0, Math.round((ing.qty + delta) * 10) / 10) };
      }
      return ing;
    });
    saveIngredients(updated);
  }

  // POS operations
  function addToPos(item: MenuItem) {
    const price = item.price ?? item.hot ?? item.iced ?? 10;
    setPosCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price, qty: 1 }];
    });
  }

  function completeSale() {
    if (posCart.length === 0) return;
    const total = posCart.reduce((sum, item) => sum + item.qty * item.price, 0);
    const summary = posCart.map((i) => `${i.qty}× ${i.name}`).join(', ');
    const newOrder: OrderRecord = {
      id: `WS-${1001 + orders.length}`,
      time: timeStr || 'Just now',
      items: summary,
      method: posMethod,
      total,
      status: 'Completed',
    };

    saveOrders([newOrder, ...orders]);
    setPosCart([]);

    // Proxy stock consumption
    adjustStock('beans-colombia', -0.02 * posCart.length);
    adjustStock('cups-hot', -posCart.length);

    setMsg({ text: `✅ Order #${newOrder.id} completed for SAR ${total} (${posMethod})` });
  }

  // Menu item save
  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    const payload = {
      id: form.id || undefined,
      name: form.name.trim(),
      nameAr: form.nameAr.trim() || undefined,
      category: form.category,
      hot: form.hot === '' ? undefined : Number(form.hot),
      iced: form.iced === '' ? undefined : Number(form.iced),
      price: form.price === '' ? undefined : Number(form.price),
      description: form.description.trim() || undefined,
      notes: form.notes.trim() || undefined,
      tag: form.tag.trim() || undefined,
      image: form.image.trim() || undefined,
      active: form.active,
    };

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMsg({ text: `✅ Successfully saved "${payload.name}"` });
        setForm(BLANK_ITEM);
        loadMenu();
      } else {
        const errData = await res.json();
        setMsg({ text: errData.error || 'Failed to save item', error: true });
      }
    } catch {
      setMsg({ text: 'Network error saving menu item', error: true });
    }
  }

  // Quick 86 item toggle
  async function toggleActive(item: MenuItem) {
    const updated = { ...item, active: !item.active };
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
        setMsg({
          text: updated.active
            ? `🟢 "${item.name}" is now Active on public menu`
            : `🔴 "${item.name}" has been 86'd (Marked Sold Out on public menu)`,
        });
      }
    } catch {
      setMsg({ text: 'Failed to update item availability', error: true });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/admin/menu?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMsg({ text: `Deleted "${name}"` });
        loadMenu();
      } else {
        setMsg({ text: 'Failed to delete item', error: true });
      }
    } catch {
      setMsg({ text: 'Error connecting to delete service', error: true });
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  }

  const criticalIngCount = ingredients.filter((i) => i.qty <= i.min).length;
  const grossSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgTicket = totalOrdersCount > 0 ? (grossSales / totalOrdersCount).toFixed(2) : '0.00';
  const madaTotal = orders.filter((o) => o.method === 'Mada').reduce((s, o) => s + o.total, 0);
  const appleTotal = orders.filter((o) => o.method === 'Apple Pay').reduce((s, o) => s + o.total, 0);
  const cashTotal = orders.filter((o) => o.method === 'Cash').reduce((s, o) => s + o.total, 0);

  return (
    <main className="admin-shell" style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 20px', direction: 'ltr' }}>
      {/* Header with Mascot */}
      <header
        style={{
          background: 'linear-gradient(135deg, #0a261f 0%, #0e382c 60%, #154537 100%)',
          color: '#fff',
          padding: '20px 24px',
          borderRadius: 16,
          borderBottom: '3px solid var(--ws-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/waseem-mascot-bust.png"
            alt="Captain Waseem"
            style={{
              height: 76,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
            }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontFamily: 'Cinzel, serif', color: '#fff' }}>
              Waseem Cafe · Operations Command Center
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--ws-gold-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Inventory, Live Sales, Prices & Barista Operations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleStoreOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: storeOpen ? 'rgba(255,255,255,0.15)' : 'rgba(244, 63, 94, 0.25)',
              border: `1px solid ${storeOpen ? 'rgba(255,255,255,0.3)' : 'rgba(251, 113, 133, 0.6)'}`,
              color: '#fff',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: storeOpen ? '#22c55e' : '#f43f5e',
                boxShadow: `0 0 8px ${storeOpen ? '#22c55e' : '#f43f5e'}`,
              }}
            />
            <span>{storeOpen ? 'Store Open (Click to Close)' : 'Store Closed (Click to Open)'}</span>
          </button>

          <span style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 20 }}>
            🕒 {timeStr || 'Riyadh, KSA'}
          </span>

          <a
            href="/"
            style={{
              color: '#0a261f',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: 8,
              background: 'var(--ws-gold)',
            }}
          >
            🌿 Customer Menu
          </a>

          <button
            onClick={() => setPinModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            🔑 Change PIN
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid #ef4444',
              color: '#fca5a5',
              background: 'rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Store Closed Banner inside Admin */}
      {!storeOpen && (
        <div
          style={{
            background: 'linear-gradient(90deg, #9f1239, #e11d48)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span>
            🌙 CAFE IS CURRENTLY SET TO CLOSED: Customers see a &quot;Cafe Currently Closed&quot; banner on the public menu and ordering is paused.
          </span>
          <button
            onClick={handleToggleStoreOpen}
            style={{
              background: '#fff',
              color: '#9f1239',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            🟢 Reopen Cafe Now
          </button>
        </div>
      )}

      {/* Passcode Change Modal */}
      {pinModalOpen && (
        <div
          onClick={() => setPinModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,38,31,0.8)',
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
              background: '#fff',
              borderRadius: 16,
              width: 'min(100%, 420px)',
              padding: 24,
              border: '2px solid var(--ws-gold)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', color: 'var(--ws-emerald)', fontFamily: 'Cinzel, serif' }}>
              🔑 Change Manager Passcode
            </h3>
            <form onSubmit={handleChangePasscode} style={{ display: 'grid', gap: 12 }}>
              <label className="admin-field">
                Current Passcode *
                <input
                  type="password"
                  required
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current passcode (default: 1234)"
                />
              </label>
              <label className="admin-field">
                New Passcode *
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new passcode (min 4 digits)"
                />
              </label>
              <label className="admin-field">
                Confirm New Passcode *
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm new passcode"
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--ws-line)', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--ws-emerald)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  🔒 Update Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid var(--ws-line)',
          marginBottom: 20,
          overflowX: 'auto',
          background: '#fff',
          padding: '0 10px',
          borderRadius: 10,
        }}
      >
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--ws-emerald)' : 'none',
            color: activeTab === 'analytics' ? 'var(--ws-emerald)' : 'var(--ws-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          📊 Sales & Analytics
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'menu' ? '3px solid var(--ws-emerald)' : 'none',
            color: activeTab === 'menu' ? 'var(--ws-emerald)' : 'var(--ws-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          🏷️ Prices, Photos & Menu Editor
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'inventory' ? '3px solid var(--ws-emerald)' : 'none',
            color: activeTab === 'inventory' ? 'var(--ws-emerald)' : 'var(--ws-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          📦 Raw Ingredients & Supplies
          {criticalIngCount > 0 && (
            <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 11, padding: '2px 6px', borderRadius: 10 }}>
              {criticalIngCount} Low Alert
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'pos' ? '3px solid var(--ws-emerald)' : 'none',
            color: activeTab === 'pos' ? 'var(--ws-emerald)' : 'var(--ws-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ⚡ Quick POS Checkout
        </button>

        <button
          onClick={() => setActiveTab('zreport')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'zreport' ? '3px solid var(--ws-emerald)' : 'none',
            color: activeTab === 'zreport' ? 'var(--ws-emerald)' : 'var(--ws-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          📋 Daily Shift Z-Report
        </button>
      </nav>

      {msg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            background: msg.error ? '#fef2f2' : '#f0fdf4',
            color: msg.error ? '#991b1b' : '#166534',
            border: `1px solid ${msg.error ? '#f87171' : '#86efac'}`,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', padding: 18, borderRadius: 12, border: '1px solid var(--ws-line)', borderTop: '4px solid var(--ws-emerald)' }}>
              <div style={{ fontSize: 13, color: 'var(--ws-text-muted)', fontWeight: 600 }}>Gross Sales (Today)</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ws-emerald)', margin: '6px 0' }}>SAR {grossSales.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>VAT inclusive live total</div>
            </div>

            <div style={{ background: '#fff', padding: 18, borderRadius: 12, border: '1px solid var(--ws-line)', borderTop: '4px solid var(--ws-gold)' }}>
              <div style={{ fontSize: 13, color: 'var(--ws-text-muted)', fontWeight: 600 }}>Completed Orders</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ws-text-main)', margin: '6px 0' }}>{totalOrdersCount} orders</div>
              <div style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>Today&apos;s transaction count</div>
            </div>

            <div style={{ background: '#fff', padding: 18, borderRadius: 12, border: '1px solid var(--ws-line)', borderTop: '4px solid #14b8a6' }}>
              <div style={{ fontSize: 13, color: 'var(--ws-text-muted)', fontWeight: 600 }}>Average Ticket</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ws-text-main)', margin: '6px 0' }}>
                SAR {avgTicket}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>Average spend per ticket</div>
            </div>

            <div style={{ background: '#fff', padding: 18, borderRadius: 12, border: '1px solid var(--ws-line)', borderTop: '4px solid #f59e0b' }}>
              <div style={{ fontSize: 13, color: 'var(--ws-text-muted)', fontWeight: 600 }}>Top Selling Drink</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ws-emerald)', margin: '6px 0' }}>
                {totalOrdersCount > 0 ? 'Recorded Drinks' : 'Awaiting Orders'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>
                {totalOrdersCount > 0 ? `${totalOrdersCount} orders served` : 'No sales recorded yet'}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--ws-line)', padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--ws-emerald)', fontWeight: 800 }}>
              Live Recent Orders Feed
            </h3>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px 10px', color: '#888', margin: 0 }}>
                No orders recorded today yet. Use Quick POS to ring up a transaction.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: '#fbf9f5',
                      border: '1px solid var(--ws-line)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--ws-emerald)', fontSize: 14 }}>
                        {ord.id} · <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>{ord.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ws-text-main)', marginTop: 2 }}>{ord.items}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ws-emerald)', fontSize: 15 }}>SAR {ord.total.toFixed(2)}</div>
                      <span style={{ fontSize: 11, background: '#e2ece7', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {ord.method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: 'var(--ws-emerald)' }}>Raw Ingredients & Supplies Warehouse</h3>
            <span style={{ fontSize: 13, color: 'var(--ws-text-muted)' }}>Use (+ / −) to adjust stock counts on the fly</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {ingredients.map((ing) => {
              const isCrit = ing.qty <= ing.min;
              const pct = Math.min(100, Math.round((ing.qty / ing.max) * 100));
              return (
                <div
                  key={ing.id}
                  style={{
                    background: isCrit ? '#fffafa' : '#fff',
                    borderRadius: 12,
                    border: `1px solid ${isCrit ? '#fca5a5' : 'var(--ws-line)'}`,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ws-emerald)' }}>{ing.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{ing.nameEn}</div>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: isCrit ? '#fee2e2' : '#f0fdf4',
                        color: isCrit ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {isCrit ? 'Low Alert' : 'In Stock'}
                    </span>
                  </div>

                  <div style={{ margin: '10px 0', fontSize: 13 }}>
                    Current Stock: <strong>{ing.qty} {ing.unit}</strong>
                    <div style={{ height: 6, background: '#eee', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: isCrit ? '#dc2626' : '#16a34a' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => adjustStock(ing.id, -1)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--ws-line)', background: '#fff', cursor: 'pointer' }}
                    >
                      −1
                    </button>
                    <button
                      onClick={() => adjustStock(ing.id, 1)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--ws-line)', background: '#fff', cursor: 'pointer' }}
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustStock(ing.id, 5)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--ws-line)', background: '#fff', cursor: 'pointer' }}
                    >
                      +5
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: QUICK POS */}
      {activeTab === 'pos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: 'var(--ws-emerald)' }}>Tap any drink to add to register:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => addToPos(it)}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--ws-line)',
                    borderRadius: 10,
                    padding: 12,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {it.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={it.image}
                      alt={it.name}
                      style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', margin: '0 auto 4px', display: 'block' }}
                    />
                  ) : (
                    <div style={{ fontSize: 22 }}>☕</div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ws-emerald)', marginTop: 4 }}>
                    {it.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ws-gold-dark)', fontWeight: 800 }}>
                    SAR {it.price ?? it.hot ?? it.iced ?? 10}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '2px solid var(--ws-gold)', padding: 18, height: 'fit-content' }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--ws-emerald)', borderBottom: '1px solid var(--ws-line)', paddingBottom: 8 }}>
              🧾 Register Ticket
            </h4>
            <div style={{ minHeight: 120, marginBottom: 12 }}>
              {posCart.length === 0 ? (
                <p style={{ color: '#888', fontSize: 12, textAlign: 'center', marginTop: 30 }}>Cart is empty</p>
              ) : (
                posCart.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, margin: '6px 0' }}>
                    <span>{p.name} × {p.qty}</span>
                    <span>SAR {p.price * p.qty}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, borderTop: '2px solid var(--ws-emerald)', paddingTop: 10, marginBottom: 12 }}>
              <span>Total:</span>
              <span>SAR {posCart.reduce((sum, p) => sum + p.qty * p.price, 0)}</span>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['Mada', 'Apple Pay', 'Cash'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPosMethod(m)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 6,
                    border: '1px solid var(--ws-line)',
                    background: posMethod === m ? 'var(--ws-emerald)' : '#fff',
                    color: posMethod === m ? '#fff' : 'var(--ws-text-main)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={completeSale}
              style={{
                width: '100%',
                background: 'var(--ws-emerald)',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ✅ Complete Sale & Deduct Stock
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MENU ITEMS, PHOTOS & PRICES */}
      {activeTab === 'menu' && (
        <div>
          <section className="admin-form-card">
            <h2 style={{ margin: '0 0 16px', color: 'var(--ws-emerald)', fontFamily: 'Cinzel, serif', fontSize: 18 }}>
              {form.id ? `✏️ Edit Item: ${form.name}` : '➕ Add New Menu Item & Photo'}
            </h2>

            <form onSubmit={handleSave}>
              {/* Photo Upload Zone */}
              <div
                style={{
                  border: '2px dashed var(--ws-gold)',
                  background: '#faf8f3',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--ws-emerald)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--ws-gold-light)',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 700,
                  }}
                >
                  {form.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>WS</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <label
                      style={{
                        background: 'var(--ws-emerald)',
                        color: '#fff',
                        padding: '7px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      📷 Upload Photo from Device
                      <input type="file" accept="image/*" onChange={handlePhotoFileChange} style={{ display: 'none' }} />
                    </label>
                    {form.image && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: '' })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          background: '#fff',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Remove Photo
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--ws-text-muted)' }}>
                    Photos are automatically center-cropped and optimized to 600×600px HD for perfect rendering on the menu and lightbox.
                  </p>
                  <input
                    value={form.image?.startsWith('data:') ? '' : form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder={form.image?.startsWith('data:') ? '✅ Custom uploaded photo ready' : 'Or paste image URL / path (e.g. /images/v60-colombia.jpg)'}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--ws-line)', fontSize: 12 }}
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <label className="admin-field">
                  Name (English) *
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Pistachio Latte"
                  />
                </label>

                <label className="admin-field">
                  Name (Arabic)
                  <input
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="e.g. بستاشيو لاتيه"
                  />
                </label>

                <label className="admin-field">
                  Category *
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  Badge / Tag
                  <input
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. Signature, Bestseller, New"
                  />
                </label>

                <label className="admin-field">
                  Hot Price (SAR)
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hot}
                    onChange={(e) => setForm({ ...form, hot: e.target.value })}
                  />
                </label>

                <label className="admin-field">
                  Iced Price (SAR)
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.iced}
                    onChange={(e) => setForm({ ...form, iced: e.target.value })}
                  />
                </label>

                <label className="admin-field">
                  Single / Regular Price (SAR)
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </label>

                <label className="admin-field">
                  Flavor Notes
                  <input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Caramel • Chocolate • Nutty"
                  />
                </label>

                <label className="admin-field" style={{ gridColumn: '1 / -1' }}>
                  Description
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the roast, origin, or preparation..."
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  type="submit"
                  className="action-btn"
                  style={{ background: 'var(--ws-emerald)', color: '#fff', padding: '10px 20px', fontSize: 14, borderRadius: 8, cursor: 'pointer' }}
                >
                  💾 {form.id ? 'Save Changes' : 'Add Item to Menu'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(BLANK_ITEM)}
                    className="action-btn"
                    style={{ padding: '10px 18px', fontSize: 14, borderRadius: 8, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <h3 style={{ color: 'var(--ws-emerald)', fontSize: 18, marginBottom: 12 }}>
              Current Menu Items & Availability Control ({items.length} items)
            </h3>

            {loading ? (
              <p>Loading items...</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {items.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#ffffff',
                      borderRadius: 10,
                      border: '1px solid var(--ws-line)',
                      opacity: it.active ? 1 : 0.6,
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: 'var(--ws-emerald)',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'var(--ws-gold-light)',
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {it.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={it.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>WS</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                          {it.name} {it.nameAr && <span style={{ color: '#888', fontSize: 12 }}>({it.nameAr})</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>
                          {it.category} · {it.hot !== undefined && `Hot: SAR ${it.hot} `}
                          {it.iced !== undefined && `Iced: SAR ${it.iced} `}
                          {it.price !== undefined && `Regular: SAR ${it.price}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={() => toggleActive(it)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: it.active ? '#f0fdf4' : '#fee2e2',
                          color: it.active ? '#16a34a' : '#dc2626',
                          border: `1px solid ${it.active ? '#86efac' : '#fca5a5'}`,
                        }}
                      >
                        {it.active ? '🟢 Active (Visible)' : "🔴 86'd (Sold Out)"}
                      </button>
                      <button
                        onClick={() => {
                          setForm({
                            id: it.id,
                            name: it.name,
                            nameAr: it.nameAr || '',
                            category: it.category,
                            hot: it.hot ?? '',
                            iced: it.iced ?? '',
                            price: it.price ?? '',
                            description: it.description || '',
                            notes: it.notes || '',
                            tag: it.tag || '',
                            image: it.image || '',
                            active: it.active !== false,
                          });
                          window.scrollTo({ top: 150, behavior: 'smooth' });
                        }}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--ws-line)', background: '#fff', cursor: 'pointer' }}
                      >
                        📷 Edit / Photo
                      </button>
                      <button
                        onClick={() => handleDelete(it.id, it.name)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', color: '#ef4444', background: '#fff', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 5: Z-REPORT */}
      {activeTab === 'zreport' && (
        <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 14, border: '2px dashed var(--ws-emerald)' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--ws-emerald)', paddingBottom: 16, marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 4px', color: 'var(--ws-emerald)', fontSize: 20 }}>Waseem Cafe · End of Shift Z-Report</h2>
            <div style={{ fontSize: 12, color: '#888' }}>Shift Date: {new Date().toLocaleDateString('en-US')}</div>
          </div>

          <div style={{ display: 'grid', gap: 10, fontSize: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>Gross Sales (Tax Inclusive):</span>
              <strong>SAR {grossSales.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>VAT (15% ZATCA Standard):</span>
              <strong>SAR {(grossSales - grossSales / 1.15).toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>Net Revenue (Excl. Tax):</span>
              <strong>SAR {(grossSales / 1.15).toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>Total Transactions:</span>
              <strong>{totalOrdersCount} orders</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>Mada Payments:</span>
              <strong>SAR {madaTotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>Apple Pay:</span>
              <strong>SAR {appleTotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
              <span>Cash in Register:</span>
              <strong>SAR {cashTotal.toFixed(2)}</strong>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              width: '100%',
              background: 'var(--ws-emerald)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🖨️ Print Shift Z-Report
          </button>
        </div>
      )}
    </main>
  );
}
