# Waseem Cafe

Responsive English menu with cart, WhatsApp order draft, tap-to-call, QR and a private menu editor.

## Customer ordering
Customers choose hot/iced options and quantities, review the cart and total, then tap **Order on WhatsApp**. WhatsApp opens a pre-filled message to +966511313965; the customer sends it manually. No customer name or pickup/delivery form is requested. Call link: `tel:+966511313965` (display number 051 131 3965).

## Local setup
Node.js 20+. Run `npm install`, copy `.env.example` to `.env.local`, set `ADMIN_PASSWORD` and `SESSION_SECRET`, then `npm run dev`. Open http://localhost:3000. Never commit real secrets.

## Persistent menu and admin
The admin is at `/admin/login`. Menu edits use Vercel KV / Upstash Redis via `@vercel/kv`. Create a KV store, configure `KV_REST_API_URL` and `KV_REST_API_TOKEN`, and set `ADMIN_PASSWORD` plus `SESSION_SECRET` in the host's private environment settings. Without KV configuration edits cannot persist. Admin APIs require a signed, HTTP-only session cookie.

## Deployment
Import this repository to Vercel or another compatible Next.js host, configure all four environment variables, deploy and test `/admin/login`, public menu, cart, WhatsApp draft, and phone call link. This commit does not provision the KV account, configure secrets or publish the site.

## QR and printing
QR uses the current public origin once deployed; localhost QR is development-only. Print CSS creates a black-and-white long-menu layout targeting 210 mm width. Continuous roll length and usable width depend on the actual printer and driver; test before printing.

## Menu
Latte hot ⃁5 / iced ⃁8; Cappuccino hot ⃁5 / iced ⃁8; Mocha hot ⃁5 / iced ⃁8; Americano hot ⃁5 / iced ⃁10; V60 ⃁10; Karak Tea hot ⃁3; Fresh Juice ⃁5.
