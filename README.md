# Waseem Cafe

A responsive English-language menu site with a cream-and-espresso theme, a menu API, WhatsApp contact link, QR code based on the deployed page URL, and a long black-and-white print stylesheet.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The QR encodes the current page URL. A locally generated QR points to localhost and is not useful to customers; deploy first, then print a QR from the public URL and test it with a phone.

## Menu API

`GET /api/menu` returns the menu data as JSON.

## Deploy

Import this repository into a Next.js-compatible host such as Vercel and deploy. Confirm the public URL works on a phone. The menu QR component uses the current site origin, so on the deployed site it will encode that public address.

## Print

Use the browser print dialog and enable background graphics only if desired. The print stylesheet converts the page to black and white and requests a long page sized 210 mm wide. Browser and printer drivers may ignore automatic page length. Confirm the printer model, roll/paper width and driver settings, and print a short test before printing the full menu.

## Mascot artwork

The current mascot shapes are placeholders, not a finished likeness-based illustration. Add approved artwork assets once prepared; do not use the concept-sheet image as the production menu itself.

## Currency

Prices display the requested Saudi riyal symbol `⃁`. Verify the symbol renders correctly in the chosen browser and printer font; an official vector asset can be substituted if needed.
