# Waseem Cafe

## Static visual preview
The `preview/` folder is a standalone static demonstration intended for GitHub Pages. It includes the current menu, interactive cart, prefilled WhatsApp order link and click-to-call link. It does not include the backend, admin editor, or persistent menu changes. The QR is intended for `https://acwaops.github.io/waseem-cafe/`; verify that URL after Pages deployment before printing.

A GitHub Actions workflow publishes `preview/` whenever it changes on `main`. In repository **Settings → Pages**, choose **GitHub Actions** as the build and deployment source if it is not already selected. Check the Actions run for success; the Pages environment displays the resulting URL.

## Full Next.js application
The `app/` and `lib/` folders are the separate full-stack version. GitHub Pages cannot run its API/admin backend; use a Next.js-compatible application host and persistent KV/database service for those features.

The customer preview uses the supplied items and prices: Latte hot ⃁5 / iced ⃁8; Cappuccino hot ⃁5 / iced ⃁8; Mocha hot ⃁5 / iced ⃁8; Americano hot ⃁5 / iced ⃁10; V60 ⃁10; Karak Tea hot ⃁3; Fresh Juice ⃁5. WhatsApp destination: +966 51 131 3965.
