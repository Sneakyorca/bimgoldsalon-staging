# BIM-GOLD Salon Project Structure

This document maps the BIM-GOLD Hair & Beauty Salon Next.js application. It describes the source folders, route files, shared components, data modules, configuration, and installed agent skills.

Generated from the project source tree. Generated dependencies and build output such as `node_modules/` and `.next/` are intentionally excluded.

## Runtime Overview

- Framework: Next.js 16 App Router
- Language: TypeScript, TSX, JavaScript, and JSX
- UI: React, Tailwind CSS v4, shadcn/ui-style primitives, Lucide, Phosphor icons
- Forms: React Hook Form, Zod, and `@hookform/resolvers`
- Fonts: Poppins from `@fontsource/poppins`; Inter and Plus Jakarta Sans from `next/font/google`
- Backend direction: Supabase helpers plus backend-oriented JavaScript modules in `Data(for backend)/`
- Main user flows: home, authentication, shopping, product detail, cart, checkout, booking, profile editing, and training applications

## Root Files

- `.env.local` - Local environment variables. Keep secrets out of source control.
- `.gitignore` - Git exclusions for local, generated, and build files.
- `AGENTS.md` - Repository-level agent instructions.
- `CLAUDE.md` - Claude/agent project guidance.
- `README.md` - Basic Next.js setup and development commands.
- `PROJECT_STRUCTURE.md` - This project map.
- `package.json` - Dependencies and scripts such as `dev`, `build`, `start`, and `lint`.
- `package-lock.json` - Locked npm dependency versions.
- `skills-lock.json` - Installed skill package lock information.
- `components.json` - Component generator and UI configuration.
- `eslint.config.mjs` - ESLint configuration.
- `next.config.ts` - Next.js configuration.
- `next-env.d.ts` - Next.js generated TypeScript declarations.
- `postcss.config.mjs` - PostCSS and Tailwind processing configuration.
- `tsconfig.json` - TypeScript compiler configuration and path aliases.

## App Routes and Global UI

The `app/` directory contains the Next.js App Router routes. A `page.tsx` file defines a route, while `layout.tsx` defines shared layout UI.

```text
app/
|-- favicon.ico                         Browser favicon
|-- globals.css                          Tailwind imports, theme tokens, global animations
|-- layout.tsx                           Root layout, fonts, Navbar, Footer, CartProvider
|-- page.tsx                             Home page
|-- auth/
|   `-- page.tsx                         Authentication page shell
|-- booking/
|   |-- page.tsx                         Booking service selection route
|   |-- time/
|   |   `-- page.tsx                     Booking date/time selection route
|   |-- confirm/
|   |   `-- page.tsx                     Booking confirmation review route
|   `-- confirmed/
|       `-- page.tsx                     Completed booking route
|-- cart/
|   `-- page.tsx                         Shopping cart route
|-- checkout/
|   `-- page.tsx                         Checkout route
|-- forgot-password/
|   `-- page.tsx                         Password recovery route
|-- product/
|   |-- page.tsx                         Product listing/shop route
|   `-- [id]/
|       `-- page.tsx                     Dynamic product detail route
|-- profile/
|   `-- edit/
|       `-- page.tsx                     Profile editing route
`-- training/
    `-- page.tsx                         Training application route
```

### App Files

- `app/layout.tsx` - Root HTML layout. Loads font styles, global CSS, navigation, footer, and cart context around every page.
- `app/globals.css` - Tailwind and shadcn imports, design tokens, colors, typography, cart badge animation, and invalid-field error shake animation.
- `app/page.tsx` - Composes the public home page sections.
- `app/auth/page.tsx` - Renders the authentication experience.
- `app/booking/page.tsx` - Starts the booking flow.
- `app/booking/time/page.tsx` - Selects appointment date and time.
- `app/booking/confirm/page.tsx` - Reviews and confirms booking details.
- `app/booking/confirmed/page.tsx` - Displays the completed booking state.
- `app/cart/page.tsx` - Displays the full cart view.
- `app/checkout/page.tsx` - Displays checkout and order details.
- `app/forgot-password/page.tsx` - Renders password recovery.
- `app/product/page.tsx` - Displays the product shop.
- `app/product/[id]/page.tsx` - Resolves a product by route ID and renders its detail page and related products.
- `app/profile/edit/page.tsx` - Renders profile editing.
- `app/training/page.tsx` - Renders the training application page.
- `app/account/loading.tsx` - Account route loading state.
- `app/admin/layout.tsx` - Admin route layout boundary.
- `app/admin/loading.tsx` - Admin route loading state.
- `app/admin/error.tsx` - Admin route error boundary.
- `app/admin/page.tsx` - Admin overview route.
- `app/admin/actions.ts` - Server-side admin mutations and validation.
- `app/admin/orders/page.tsx` - Orders admin section.
- `app/admin/bookings/page.tsx` - Bookings admin section.
- `app/admin/availability/page.tsx` - Availability admin section.
- `app/admin/waitlist/page.tsx` - Waitlist admin section.
- `app/admin/customers/page.tsx` - Customers admin section.
- `app/admin/products/page.tsx` - Products admin section.
- `app/admin/services/page.tsx` - Services admin section.

## Agent Skill Folders

The project contains the installed skills in both `.agents/skills/` and `agent/skills/`. They contain the same Supabase skill package in different agent integration locations.

```text
.agents/skills/
|-- supabase/
|   |-- SKILL.md                         Supabase workflow, security, RLS, API, and CLI guidance
|   |-- CHANGELOG.md                      Supabase skill release history
|   |-- assets/
|   |   `-- feedback-issue-template.md    Template for reporting skill feedback
|   `-- references/
|       `-- skill-feedback.md             Skill feedback instructions
`-- supabase-postgres-best-practices/
    |-- SKILL.md                           PostgreSQL performance and schema guidance
    |-- CHANGELOG.md                        PostgreSQL skill release history
    `-- references/
        |-- _contributing.md               Reference contribution guidance
        |-- _sections.md                   Reference section index
        |-- _template.md                   Reference template
        |-- advanced-full-text-search.md   Full-text search recommendations
        |-- advanced-jsonb-indexing.md     JSONB indexing recommendations
        |-- conn-idle-timeout.md            Idle connection timeout guidance
        |-- conn-limits.md                  Connection limit guidance
        |-- conn-pooling.md                 Connection pooling guidance
        |-- conn-prepared-statements.md     Prepared statement guidance
        |-- data-batch-inserts.md           Batch insert guidance
        |-- data-n-plus-one.md              N+1 query guidance
        |-- data-pagination.md              Pagination guidance
        |-- data-upsert.md                  Upsert guidance
        |-- lock-advisory.md                Advisory lock guidance
        |-- lock-deadlock-prevention.md     Deadlock prevention guidance
        |-- lock-short-transactions.md      Short transaction guidance
        |-- lock-skip-locked.md             SKIP LOCKED guidance
        |-- monitor-explain-analyze.md      EXPLAIN ANALYZE guidance
        |-- monitor-pg-stat-statements.md   pg_stat_statements guidance
        |-- monitor-vacuum-analyze.md       VACUUM and ANALYZE guidance
        |-- query-composite-indexes.md      Composite index guidance
        |-- query-covering-indexes.md       Covering index guidance
        |-- query-index-types.md            Index type guidance
        |-- query-missing-indexes.md        Missing index guidance
        |-- query-partial-indexes.md        Partial index guidance
        |-- schema-constraints.md            Constraint guidance
        |-- schema-data-types.md             PostgreSQL data type guidance
        |-- schema-foreign-key-indexes.md    Foreign key index guidance
        |-- schema-lowercase-identifiers.md Lowercase identifier guidance
        |-- schema-partitioning.md           Partitioning guidance
        |-- schema-primary-keys.md           Primary key guidance
        |-- security-privileges.md           Privilege guidance
        |-- security-rls-basics.md           Basic RLS guidance
        `-- security-rls-performance.md     RLS performance guidance
```

The same structure is mirrored under `agent/skills/` for the other agent integration path:

- `agent/skills/supabase/` - Supabase skill copy.
- `agent/skills/supabase-postgres-best-practices/` - PostgreSQL best-practices skill copy.

## Components

The `components/` directory contains reusable UI and feature components. Components are grouped by user journey or site area.

### Authentication: `components/auth/`

- `AuthCardLayout.tsx` - Shared card layout for auth pages.
- `AuthShell.tsx` - Authentication page shell and composition.
- `fields.tsx` - Shared text, phone, password, validation, and primary button fields. Password visibility uses `Eye` and `EyeOff` icons.
- `ForgotPasswordForm.tsx` - Forgot-password form and submission handling.
- `SignInForm.tsx` - Sign-in form and validation.
- `SignUpForm.tsx` - Account registration form and validation.

### Booking: `components/booking/`

- `BookingShell.tsx` - Shared booking flow layout and context connection.
- `BookingSteps.tsx` - Step navigation and progress display.
- `BookingSummary.tsx` - Selected service, date, time, and booking summary.
- `ConfirmedStep.tsx` - Completed booking result state.
- `ConfirmStep.tsx` - Booking review and confirmation action.
- `ServicesStep.tsx` - Service selection step.
- `Stars.tsx` - Star rating display used in booking/service UI.
- `TimeStep.tsx` - Appointment date and time selection.

### Cart: `components/cart/`

- `CartView.tsx` - Full cart page with line items, quantities, removal, and totals.

### Account and admin: `components/account/` and `components/admin/`

- `components/account/CustomerDashboard.tsx` - Customer profile, bookings, orders, empty states, profile editing, and logout.
- `components/admin/AdminConsole.tsx` - Responsive admin shell with a fixed desktop sidebar, mobile navigation, stat cards, and section routing.
- `components/admin/AdminNav.tsx` - Shared responsive admin navigation.
- `components/admin/AdminDialog.tsx` - Native dialog with focus and body-scroll handling.
- `components/admin/BookingsTable.tsx` - Booking table and notes/payment controls.
- `components/admin/BookingsTab.tsx` - Compact admin booking status controls.
- `components/admin/CatalogTabs.tsx` - Product and service catalog sections.
- `components/admin/ProductsManager.tsx` - Product table, stock editing, create/edit dialog, and deletion.
- `components/admin/ServicesManager.tsx` - Service table, create/edit dialog, and deletion.
- `components/admin/AvailabilityManager.tsx` - Blocked-date creation and reopening.
- `components/admin/ConfirmButton.tsx` - Accessible two-step destructive action control.
- `components/admin/StatusSelect.tsx` - Optimistic status mutation select.
- `components/admin/StockEditor.tsx` - Inline stock editor.
- `components/admin/ImageField.tsx` - Main and gallery image selection and previews.
- `components/admin/ProductForm.tsx` - Dummy product create/edit form with stock, category, image, and extra information fields.
- `components/admin/ServiceForm.tsx` - Dummy service create/edit form with duration, category, image, and extra information fields.
- `components/admin/CategoryField.tsx` - Existing-category selector and new-category input.
- `components/admin/ExtraInfoEditor.tsx` - Editable label/value metadata rows.
- `components/admin/ImageThumbnails.tsx` - Preview and removal control for selected images.
- `components/admin/Table.tsx` - Accessible reusable admin table structure.
- `components/admin/ui.ts` - Shared admin buttons, panels, inputs, and labels.

### Checkout: `components/checkout/`

- `CheckoutView.tsx` - Customer details, shipping or delivery data, order summary, and checkout validation.

### Home page: `components/home/`

- `About.tsx` - About the salon section.
- `Carousel.tsx` - Homepage image/content carousel.
- `Hero.tsx` - Homepage hero section and social links.
- `Map.tsx` - Salon location and map embed.
- `Products.tsx` - Featured product section.
- `SectionTitle.tsx` - Shared homepage section heading.
- `Services.tsx` - Featured services section.
- `Social-Links.tsx` - Instagram, TikTok, and email links. Instagram and TikTok point to the salon profiles and are reused in the hero and footer.
- `Testimonials.tsx` - Customer testimonials section.
- `TrainingPopup.tsx` - Training promotion popup and display state.

### Product and shop: `components/product/` and `components/shop/`

- `components/product/ProductActions.tsx` - Product quantity and add-to-cart actions.
- `components/shop/Pagination.tsx` - Product listing pagination controls.
- `components/shop/ShopView.tsx` - Shop filters/listing composition.

### Profile: `components/profile/`

- `EditProfileForm.tsx` - Profile and password editing form.

### Site-wide components: `components/site/`

- `CartBadge.tsx` - Animated cart item-count badge.
- `CartLink.tsx` - Cart navigation link and icon variant.
- `CartMenu.tsx` - Header cart button, item count, mini-cart dropdown, removal, subtotal, cart, and checkout links.
- `CheckoutSteps.tsx` - Checkout progress indicator.
- `Footer.tsx` - Site footer, contact information, navigation, and social links.
- `HeroLogic.ts` - Homepage hero-related logic and data/helpers.
- `Logo.tsx` - Reusable BIM-GOLD logo.
- `MobileSideBar.tsx` - Mobile navigation sheet opened by the menu icon.
- `Navbar.tsx` - Fixed site header with logo, navigation, account, booking, mobile menu, and cart menu. The cart icon and badge are visible beside the mobile menu.
- `nav-links.ts` - Central navigation link definitions.
- `ProductCard.tsx` - Reusable product card with image, price, status, and actions.
- `QtyStepper.tsx` - Reusable quantity increment/decrement control.

### UI primitives: `components/ui/`

- `button.tsx` - Button variants and shared button primitive.
- `carousel.tsx` - Carousel primitive and Embla integration.
- `sheet.tsx` - Drawer/sheet primitive used by mobile navigation.

## Context

The `context/` directory stores React context providers and shared context definitions.

- `BookingContext.tsx` - Booking state provider for selected service, date, time, and booking flow data.
- `CartContext.tsx` - Cart provider for items, quantities, totals, local storage persistence, and cart operations.
- `cartContextDefinition.jsx` - Cart context definition/types used by cart-related code.

## Backend-Oriented Data

`Data(for backend)/` contains JavaScript modules organized around future or existing backend operations. These modules are data-access/service boundaries rather than App Router pages. (copied from a previous project)

- `adminCustomers.js` - Admin customer operations.
- `adminProducts.js` - Admin product operations.
- `adminServices.js` - Admin service operations.
- `analytics.js` - Analytics and reporting operations.
- `auth.js` - Authentication-related backend operations.
- `blockedDates.js` - Blocked appointment date operations.
- `booking.js` - General booking operations.
- `bookingCheckout.js` - Booking checkout operations.
- `bookingService.js` - Booking service and appointment operations.
- `orderCheckout.jsx` - Order checkout flow operations.
- `orders.js` - Order management operations.
- `productImages.js` - Product image/storage operations.
- `products.js` - Product data operations.
- `profile.js` - Customer profile operations.
- `serviceImages.js` - Service image/storage operations.
- `storage.js` - Shared storage operations.
- `vacancy.js` - Availability/vacancy operations.
- `waitlist.js` - Waitlist operations.

## Dummy Data

`dummydata/` contains local data used while UI flows are being developed or before backend wiring is complete.

- `bookingData.ts` - Services, appointment options, booking labels, and booking-related sample data.
- `deliveryData.ts` - Delivery/shipping options and sample delivery data.
- `productData.ts` - Product catalog, prices, images, categories, stock, and descriptions.

## Library Code

`lib/` contains domain utilities, schemas, and service clients shared across routes and components.

- `booking.ts` - Booking helper functions and deterministic appointment/availability logic.
- `format.ts` - Formatting helpers such as prices and display values.
- `utils.ts` - General utilities, including class-name composition helpers.
- `admin/images.ts` - Browser-only dummy image resizing and data-URL conversion for admin forms.
- `admin/constants.ts` - Shared admin statuses, stock threshold, and image limits.
- `admin/result.ts` - Standard server-action result type.
- `admin/schemas.ts` - Server-side product, service, image, and blocked-date validation.
- `admin/stock.ts` - Stock status presentation helper.
- `admin/extra-info.ts` - Stable-row editor helpers for additional product/service details.
- `date.ts` - Fixed-locale, fixed-time-zone date formatting helpers.
- `auth/admin-data.ts` - Cached admin snapshot loader.
- `auth/api.ts` - In-memory auth/data swap point with hashed demo passwords, customer/admin queries, catalog mutations, and view models.
- `auth/dal.ts` - Cached current-user lookup and user/admin route guards.
- `auth/redirect.ts` - Same-site redirect validation.
- `auth/session.ts` - Signed session and recovery cookie lifecycle.
- `auth/token.ts` - HMAC-signed token encoding and validation.
- `schemas/reset-password.ts` - Password reset validation schema and type.
- `../dummydata/accountData.ts` - Demo accounts, bookings, orders, waitlist, blocked dates, stock overrides, and admin metadata.
- `schemas/auth.ts` - Zod schemas and types for sign-in, sign-up, and authentication forms.
- `schemas/checkout.ts` - Zod schemas and types for checkout validation.
- `schemas/training.ts` - Zod schemas, types, and options for training applications.
- `supabase/client.ts` - Browser-side Supabase client setup.
- `supabase/server.ts` - Server-side Supabase client setup and request context integration.

## Public Assets

`public/` contains files served directly from the site root.

- `public/logo.png` - BIM-GOLD logo image.
- `public/images/hero.png` - Homepage hero image.
- `public/images/gallery-1.jpg` through `gallery-4.jpg` - Gallery imagery.
- `public/images/product.png` - Product imagery.
- `public/images/service-1.jpg` through `service-4.jpg` - Service imagery.

## Data and UI Flow

```text
app/layout.tsx
  |-- Navbar.tsx
  |     |-- MobileSideBar.tsx
  |     `-- CartMenu.tsx -> CartContext.tsx -> localStorage
  |-- page routes
  `-- Footer.tsx

app/booking/*
  `-- BookingShell.tsx -> BookingContext.tsx -> bookingData.ts / booking.ts

app/product/*
  `-- ShopView.tsx / ProductCard.tsx / ProductActions.tsx
        `-- productData.ts -> CartContext.tsx

app/auth/* and app/profile/*
  `-- shared fields.tsx -> Zod schemas -> form submission

app/checkout/*
  `-- CheckoutView.tsx -> checkout schema -> CartContext.tsx

app/training/*
  `-- ApplyForm.tsx -> training schema

Supabase-backed work
  `-- lib/supabase/client.ts and server.ts
        `-- Data(for backend)/* service boundaries
```

## Development Commands

Run these commands from `Bimgoldsalon/bimgoldsalon`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

The local development server is normally available at `http://localhost:3000`.
