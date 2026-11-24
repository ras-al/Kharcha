# Kharcha

A personal expense tracker that replaces `Expense.xlsx`. It is a React app backed by your own Firebase project, installable as a PWA and usable offline. Phones get a tab-bar interface with a keypad for quick entry. Laptops get a sidebar, a dashboard grid and a full data table.

## What it does

- **Daily spending** in eight categories, plus income tagged by source (scholarship, refund, other).
- **Dashboard** with this month, year to date, income, net, core spending (everything except hostel and academics) and daily average. Charts cover the monthly trend, categories, a daily heatmap, income vs spending and the weekday pattern.
- **Budgets** per category with a warning at 80% and again at 100%.
- **Fees and hostel**: college fees by year with paid or pending, both hostel stays with deposits and the advance, and a scholarship timeline.
- **Events**: Workshop/Events spending, with claimed, awaiting and received reimbursement.
- **Smart bits**: a "Large expense" badge for anything over 3× your median core day, a month-end projection, plain-language observations and one-tap recurring templates.
- **Excel import and export**, a printable monthly report, light and dark themes.

## 1. Set up Firebase

1. Go to the [Firebase console](https://console.firebase.google.com) and click **Add project**. Analytics is not needed.
2. **Authentication** > **Get started**. Under **Sign-in method**, enable **Google** and **Email/Password**.
3. **Firestore Database** > **Create database**. Choose production mode and a region close to you (for example `asia-south1`, Mumbai).
4. **Project settings** (gear icon) > **Your apps** > the web icon `</>`. Register an app called Kharcha. Hosting can be set up later.
5. Copy the config values into a new `.env` file in this folder:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   These values identify the project and are not secret, but `.env` is git-ignored anyway. Access is protected by the security rules in `firestore.rules`.

6. Install the Firebase CLI and connect this folder to your project:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## 2. Run it

Kharcha needs Node 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173 and create an account.

To try it without a Firebase project, use the local emulators (the Firebase CLI needs Java):

```bash
echo "VITE_USE_EMULATORS=true" > .env.local
npm run emulators          # in one terminal
npm run dev                # in another
```

Emulator data is wiped when the emulators stop. Delete `.env.local` when you switch to the real project.

```bash
npm test                   # importer tests (also checks Expense.xlsx when it sits in this folder)
npm run build              # production build in dist/
```

## 3. Import Expense.xlsx

1. Sign in and open **Settings** > **Import from Excel** (on a phone: **More** > **Import from Excel**).
2. Choose `Expense.xlsx`. The file is read in the browser and never uploaded as a file.
3. Check the preview. It shows entries and totals per sheet, how many scholarships were matched to income, and every cell that was skipped and why.
4. Click **Import**. Records are written in batches of 400 with a progress bar.

How the workbook maps:

| Workbook | Kharcha |
| --- | --- |
| Monthly sheets (A1 is `Date`) | One transaction per filled cell. The id is `YYYY-MM-DD_category`, so importing again updates instead of duplicating. |
| `Income` column | Income. When a scholarship from the fees sheet falls on the same day, that part is tagged "scholarship". |
| Total Cost, Total Expenditure, Except Hostel & Acedamics, totals row | Skipped and recalculated. The totals row is used to check the import. |
| `Monthly` sheet | Skipped. The **Core minus income** column on the Stats page reproduces it. |
| `Collage_Hostel`: Description / Fees | College fees. Years come from the `SUM(B5:B20)` style formulas in the year summary. Imported as paid. |
| `Collage_Hostel`: Hostel Fees blocks | One stay per block, with its deposit (from the title), advance and monthly fees. |
| `Collage_Hostel`: Scholorships | Scholarships. |

Typos are fixed on the way in: Stationary → Stationery, Acedamics → Academics, Collage → College, Scholorships → Scholarships.

Notes, tags and reimbursement status you add in Kharcha survive a re-import. Amounts, dates and categories are taken from the file again.

## 4. Deploy

```bash
npm run deploy             # builds, then deploys hosting, rules and indexes
```

The site goes live at `https://<project-id>.web.app`. Add that domain under **Authentication** > **Settings** > **Authorized domains** if Google sign-in complains.

## Launch checklist

Already handled in the code:

- **HTTPS and headers.** Firebase Hosting serves HTTPS only. `firebase.json` adds HSTS, a Content-Security-Policy, `X-Frame-Options`, `nosniff`, a referrer policy and a permissions policy.
- **No secrets in the bundle.** The only key shipped is the Firebase web API key, which is public by design; access is enforced by `firestore.rules`. `.env` is git-ignored.
- **Privacy, terms and deletion.** `/privacy` and `/terms` are readable without signing in. Settings has Delete account, which removes every record and the sign-in account.
- **No cookie banner needed.** There are no analytics, ads or tracking cookies. Sign-in state is strictly necessary storage.
- **Search and sharing.** Page titles, description, Open Graph and Twitter tags, `og-image.png`, favicons, `robots.txt` and `sitemap.xml` (generated at build from `VITE_SITE_URL` or `https://<project-id>.web.app`). Unknown addresses show a 404 page marked `noindex`.
- **Speed.** The sign-in screen loads about 160 KB gzipped; Firestore, charts and the Excel reader load only when needed. Lighthouse on the sign-in page (mobile, slow 4G): Performance 91, Accessibility 100, SEO 100.
- **Contrast.** Every text colour pair meets WCAG AA in both themes.

Do these once in the consoles:

1. **Restrict the API key.** Google Cloud console > APIs & Services > Credentials > Browser key > Application restrictions > Websites. Add `https://<project-id>.web.app/*`, `https://<project-id>.firebaseapp.com/*` and `http://localhost:5173/*`.
2. **Email enumeration protection.** Firebase console > Authentication > Settings > User actions. Keep it on.
3. **Bot protection (App Check).** Firebase console > App Check > Apps > your web app > reCAPTCHA Enterprise. Copy the site key into `.env` as `VITE_RECAPTCHA_SITE_KEY`, redeploy, watch the App Check metrics for a few days, then press **Enforce** for Cloud Firestore and Authentication.

## Keyboard shortcuts (laptop)

| Key | Action |
| --- | --- |
| `N` | Add a transaction |
| `/` | Search |
| `G` then `D` / `T` / `S` / `B` / `F` / `R` | Dashboard, Transactions, Stats, Budgets, Fees, Reports |

## Project layout

```
src/
  components/      shared UI: rows, charts, forms, overlays, import wizard
  context/         auth, theme and layout preferences, toasts, selected month, quick add
  hooks/           all data access and derived numbers (useStats, useTransactions, useFees...)
  layouts/         MobileLayout.jsx and DesktopLayout.jsx
  lib/             pure logic: categories, dates, formatting, stats, validation
  pages/<Page>/    <Page>.mobile.jsx and <Page>.desktop.jsx
  services/        firebase, auth, transactions, records, importExcel, exportExcel
  styles/          design tokens, print stylesheet
firestore.rules            per-user access and field validation
firestore.indexes.json     date + category and date + type indexes
```

The two interfaces are separate component trees. `useIsDesktop()` picks one at the router level (1024px and wider means laptop) and switches live when the window is resized. Settings > Layout can pin either one. Both trees use the same hooks and services, so a number is computed once whichever screen shows it.

## Data model

Everything lives under `users/{uid}`:

- `transactions/{id}`: `date`, `category`, `amount`, `type` (expense or income), `note`, `tags`, `source`, `reimbursement`, `origin`, `createdAt`, `updatedAt`
- `fees/{id}`: `academicYear`, `description`, `section`, `amount`, `status`, `paidDate`
- `hostel/{id}`: `stay`, `label`, `kind` (monthly, advance or deposit), `month`, `amount`, `refundable`
- `scholarships/{id}`: `name`, `amount`, `date`
- `budgets/{category}`: `monthlyLimit` (Workshop/Events is stored as `Workshop|Events`)
- `templates/{id}`: `name`, `category`, `amount`, `note`
- `settings/profile`: `currency`, `theme`, `defaultView`
