# Waseem Cafe (مقهى وسيم)
> **Specialty Coffee · Handcrafted Espresso · Fresh Juices**  
> *"Good Coffee · Better Days"*

An end-to-end cafe ordering platform, digital menu, print-ready menu system, and admin menu manager for Waseem Cafe, themed with the signature **Deep Emerald Green, Warm Gold, and Cream** visual identity.

---

## 🌟 Menu Previews (GitHub Pages)

- **Interactive Customer Menu (Emerald & Gold)**:  
  [`https://acwaops.github.io/waseem-cafe/`](https://acwaops.github.io/waseem-cafe/)
- **Black-and-White Print Menu**:  
  [`https://acwaops.github.io/waseem-cafe/black-white.html`](https://acwaops.github.io/waseem-cafe/black-white.html)

### Features on the Static Preview:
- **Barista Showcase Gallery**: High-resolution photography of signature drinks (V60 Colombia, Caffe Latte, Americano, Iced Coffee, Fresh Avocado Juice) with zoom preview.
- **Dynamic Filter Tabs**: Category filtering (Specialty Coffee, Espresso & Milk, Iced & Refreshing, Tea & Fresh Juices) and real-time live search.
- **Client-Side WhatsApp Cart**: Real-time order calculation in Saudi Riyals (`⃁`) and instant WhatsApp order pre-fill to `+966 51 131 3965`.
- **Integrated QR Code & Quick Calls**: High-precision vector QR code linking to the live menu and tap-to-call buttons.
- **Print Optimization**: Clean print stylesheets (`@media print`) for counter and table menus.

---

## ☕ Menu Offerings

| Category | Item | Variations & Pricing (SAR) | Flavor Notes / Details |
| :--- | :--- | :--- | :--- |
| **Specialty Coffee** | **V60 Specialty Coffee** | Hot: ⃁ 10 \| Iced: ⃁ 12 | 100% Arabica Colombia, Single Origin. Notes of Caramel, Chocolate & Nutty. |
| **Specialty Coffee** | **Iced V60** | ⃁ 12 | Smooth, clean, and flavorful pour-over over ice. |
| **Espresso & Milk** | **Americano** | Hot: ⃁ 5 \| Iced: ⃁ 10 | Espresso + Water — Simple, Rich, and Classic. |
| **Espresso & Milk** | **Caffe Latte** | Hot: ⃁ 5 \| Iced: ⃁ 8 | Handcrafted espresso with velvety microfoam & rosette latte art. |
| **Espresso & Milk** | **Cappuccino** | Hot: ⃁ 5 \| Iced: ⃁ 8 | Balanced double shot with dense warm froth and cocoa dusting. |
| **Espresso & Milk** | **Caffe Mocha** | Hot: ⃁ 5 \| Iced: ⃁ 8 | Deep espresso blended with Dutch cocoa and steamed milk. |
| **Iced & Refreshing** | **Spanish Latte** | Hot: ⃁ 7 \| Iced: ⃁ 10 | Specialty espresso sweetened with textured condensed milk. |
| **Iced & Refreshing** | **Iced Americano** | ⃁ 10 | Bold, refreshing double shot poured over cold filtered ice. |
| **Tea & Fresh Juices** | **Fresh Avocado Juice** | ⃁ 12 | Fresh blended avocado with milk and honey. Healthy and delicious. |
| **Tea & Fresh Juices** | **Karak Tea** | Hot: ⃁ 3 | Traditional spiced black tea simmered with evaporated milk and cardamom. |
| **Tea & Fresh Juices** | **Fresh Orange Juice** | ⃁ 8 | 100% cold-pressed Valencia oranges, no added sugars. |
| **Tea & Fresh Juices** | **Iced Karkadeh (Hibiscus)** | ⃁ 7 | Natural hibiscus infusion brewed and chilled over ice. |

---

## 💻 Full-Stack Next.js 15 Application

The repository contains a complete Next.js 15 app located in `app/` and `lib/`:

### Key Capabilities:
- **Interactive Customer Portal (`app/page.tsx`)**: Responsive, accessible digital menu with dynamic category grouping, image modal previews, search, and pre-formatted WhatsApp cart dispatch.
- **Admin Management Portal (`app/admin/page.tsx`)**: Secure menu editor allowing adding, editing, re-pricing, tagging, and toggling visibility of menu items.
- **Hybrid Data Persistence (`lib/store.ts`)**:
  - Connects to Vercel KV / Upstash Redis when configured in production (`KV_REST_API_URL`).
  - Automatically falls back to local file storage (`data/menu.json`) and memory cache for offline/local development, preventing crashes when KV is not set up.
- **JWT Admin Security (`lib/auth.ts`)**: Protected API routes and cookie-based authentication.

### Running Locally:
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) for the public customer menu, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

### Environment Configuration:
Copy `.env.example` to `.env.local` to configure production secrets:
```env
# Optional: Vercel KV / Upstash Redis credentials
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Admin Dashboard Password
ADMIN_PASSWORD=your_secure_password_here

# Session Secret for JWT Cookies
SESSION_SECRET=your_32_char_random_secret_here
```
