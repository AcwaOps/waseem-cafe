'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { MenuItem } from '@/lib/store';

const CATEGORIES = [
  'Specialty Coffee',
  'Espresso & Milk',
  'Iced & Refreshing',
  'Tea & Fresh Juices',
];

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
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<any>(BLANK_ITEM);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch {
      setMsg({ text: 'Error connecting to menu service', error: true });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  function handleEdit(item: MenuItem) {
    setForm({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr || '',
      category: item.category,
      hot: item.hot ?? '',
      iced: item.iced ?? '',
      price: item.price ?? '',
      description: item.description || '',
      notes: item.notes || '',
      tag: item.tag || '',
      image: item.image || '',
      active: item.active !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
        setMsg({ text: `Successfully saved "${payload.name}"` });
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

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <a href="/" style={{ color: 'var(--ws-emerald)', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
            ← Public Cafe Menu
          </a>
          <h1 className="admin-title">Waseem Cafe Menu Manager</h1>
        </div>
        <button
          onClick={handleLogout}
          className="action-btn"
          style={{ borderColor: '#b91c1c', color: '#b91c1c' }}
        >
          Sign Out
        </button>
      </header>

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

      {/* Editor Form */}
      <section className="admin-form-card">
        <h2 style={{ margin: '0 0 16px', color: 'var(--ws-emerald)', fontFamily: 'Cinzel, serif', fontSize: 20 }}>
          {form.id ? `Edit Item: ${form.name}` : 'Add New Menu Item'}
        </h2>

        <form onSubmit={handleSave}>
          <div className="admin-form-grid">
            <label className="admin-field">
              Name (English) *
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. V60 Specialty Coffee"
              />
            </label>

            <label className="admin-field">
              Name (Arabic)
              <input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                placeholder="e.g. قهوة مختصة V60"
                dir="rtl"
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
                placeholder="e.g. Signature, Bestseller"
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
                placeholder="Leave blank if not available"
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
                placeholder="Leave blank if not available"
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
                placeholder="Used when drink has one size"
              />
            </label>

            <label className="admin-field">
              Image Path / URL
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="e.g. /images/v60-colombia.jpg"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gap: 14, marginBottom: 16 }}>
            <label className="admin-field">
              Flavor Notes (Highlights)
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Caramel • Chocolate • Nutty"
              />
            </label>

            <label className="admin-field">
              Description
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Full description of ingredients, bean origin, roast level..."
              />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="activeCheckbox" style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Visible on Public Menu
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              className="action-btn"
              style={{ background: 'var(--ws-emerald)', color: '#fff', padding: '10px 20px', fontSize: 14 }}
            >
              💾 {form.id ? 'Save Changes' : 'Add Item'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(BLANK_ITEM)}
                className="action-btn"
                style={{ padding: '10px 18px', fontSize: 14 }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Item List */}
      <section>
        <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--ws-emerald)', fontSize: 20, marginBottom: 14 }}>
          Current Menu ({items.length} items)
        </h2>

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
                  borderRadius: 8,
                  border: '1px solid var(--ws-line)',
                  opacity: it.active ? 1 : 0.6,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {it.name} {it.nameAr && <span style={{ color: 'var(--ws-emerald)', fontSize: 13 }}>({it.nameAr})</span>}
                    {!it.active && <span style={{ color: '#b91c1c', fontSize: 11, marginLeft: 8 }}>(Hidden)</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>
                    {it.category} · {it.hot !== undefined && `Hot: ⃁ ${it.hot} `}
                    {it.iced !== undefined && `Iced: ⃁ ${it.iced} `}
                    {it.price !== undefined && `Regular: ⃁ ${it.price}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(it)} className="action-btn">
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(it.id, it.name)}
                    className="action-btn"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
