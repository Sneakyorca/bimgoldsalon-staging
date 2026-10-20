# BIM-GOLD Salon Project Structure

Complete current folder and file listing for `Bimgoldsalon/bimgoldsalon`.

Generated folders are intentionally omitted from this document:

- `node_modules/` - Installed npm dependencies.
- `.next/` - Next.js build and development output.
- `.git/` - Git repository metadata.

`.env.local` is listed by filename only. Its environment variable values and secrets are not documented here.

```text
bimgoldsalon/
+-- .agents/
|   \-- skills/
|       +-- supabase/
|       |   +-- assets/
|       |   |   \-- feedback-issue-template.md
|       |   +-- references/
|       |   |   \-- skill-feedback.md
|       |   +-- CHANGELOG.md
|       |   \-- SKILL.md
|       \-- supabase-postgres-best-practices/
|           +-- references/
|           |   +-- _contributing.md
|           |   +-- _sections.md
|           |   +-- _template.md
|           |   +-- advanced-full-text-search.md
|           |   +-- advanced-jsonb-indexing.md
|           |   +-- conn-idle-timeout.md
|           |   +-- conn-limits.md
|           |   +-- conn-pooling.md
|           |   +-- conn-prepared-statements.md
|           |   +-- data-batch-inserts.md
|           |   +-- data-n-plus-one.md
|           |   +-- data-pagination.md
|           |   +-- data-upsert.md
|           |   +-- lock-advisory.md
|           |   +-- lock-deadlock-prevention.md
|           |   +-- lock-short-transactions.md
|           |   +-- lock-skip-locked.md
|           |   +-- monitor-explain-analyze.md
|           |   +-- monitor-pg-stat-statements.md
|           |   +-- monitor-vacuum-analyze.md
|           |   +-- query-composite-indexes.md
|           |   +-- query-covering-indexes.md
|           |   +-- query-index-types.md
|           |   +-- query-missing-indexes.md
|           |   +-- query-partial-indexes.md
|           |   +-- schema-constraints.md
|           |   +-- schema-data-types.md
|           |   +-- schema-foreign-key-indexes.md
|           |   +-- schema-lowercase-identifiers.md
|           |   +-- schema-partitioning.md
|           |   +-- schema-primary-keys.md
|           |   +-- security-privileges.md
|           |   +-- security-rls-basics.md
|           |   \-- security-rls-performance.md
|           +-- CHANGELOG.md
|           \-- SKILL.md
+-- .claude/
|   \-- skills/
|       +-- supabase/
|       |   +-- assets/
|       |   |   \-- feedback-issue-template.md
|       |   +-- references/
|       |   |   \-- skill-feedback.md
|       |   +-- CHANGELOG.md
|       |   \-- SKILL.md
|       \-- supabase-postgres-best-practices/
|           +-- references/
|           |   +-- _contributing.md
|           |   +-- _sections.md
|           |   +-- _template.md
|           |   +-- advanced-full-text-search.md
|           |   +-- advanced-jsonb-indexing.md
|           |   +-- conn-idle-timeout.md
|           |   +-- conn-limits.md
|           |   +-- conn-pooling.md
|           |   +-- conn-prepared-statements.md
|           |   +-- data-batch-inserts.md
|           |   +-- data-n-plus-one.md
|           |   +-- data-pagination.md
|           |   +-- data-upsert.md
|           |   +-- lock-advisory.md
|           |   +-- lock-deadlock-prevention.md
|           |   +-- lock-short-transactions.md
|           |   +-- lock-skip-locked.md
|           |   +-- monitor-explain-analyze.md
|           |   +-- monitor-pg-stat-statements.md
|           |   +-- monitor-vacuum-analyze.md
|           |   +-- query-composite-indexes.md
|           |   +-- query-covering-indexes.md
|           |   +-- query-index-types.md
|           |   +-- query-missing-indexes.md
|           |   +-- query-partial-indexes.md
|           |   +-- schema-constraints.md
|           |   +-- schema-data-types.md
|           |   +-- schema-foreign-key-indexes.md
|           |   +-- schema-lowercase-identifiers.md
|           |   +-- schema-partitioning.md
|           |   +-- schema-primary-keys.md
|           |   +-- security-privileges.md
|           |   +-- security-rls-basics.md
|           |   \-- security-rls-performance.md
|           +-- CHANGELOG.md
|           \-- SKILL.md
+-- agent/
|   \-- skills/
|       +-- supabase/
|       |   +-- assets/
|       |   |   \-- feedback-issue-template.md
|       |   +-- references/
|       |   |   \-- skill-feedback.md
|       |   +-- CHANGELOG.md
|       |   \-- SKILL.md
|       \-- supabase-postgres-best-practices/
|           +-- references/
|           |   +-- _contributing.md
|           |   +-- _sections.md
|           |   +-- _template.md
|           |   +-- advanced-full-text-search.md
|           |   +-- advanced-jsonb-indexing.md
|           |   +-- conn-idle-timeout.md
|           |   +-- conn-limits.md
|           |   +-- conn-pooling.md
|           |   +-- conn-prepared-statements.md
|           |   +-- data-batch-inserts.md
|           |   +-- data-n-plus-one.md
|           |   +-- data-pagination.md
|           |   +-- data-upsert.md
|           |   +-- lock-advisory.md
|           |   +-- lock-deadlock-prevention.md
|           |   +-- lock-short-transactions.md
|           |   +-- lock-skip-locked.md
|           |   +-- monitor-explain-analyze.md
|           |   +-- monitor-pg-stat-statements.md
|           |   +-- monitor-vacuum-analyze.md
|           |   +-- query-composite-indexes.md
|           |   +-- query-covering-indexes.md
|           |   +-- query-index-types.md
|           |   +-- query-missing-indexes.md
|           |   +-- query-partial-indexes.md
|           |   +-- schema-constraints.md
|           |   +-- schema-data-types.md
|           |   +-- schema-foreign-key-indexes.md
|           |   +-- schema-lowercase-identifiers.md
|           |   +-- schema-partitioning.md
|           |   +-- schema-primary-keys.md
|           |   +-- security-privileges.md
|           |   +-- security-rls-basics.md
|           |   \-- security-rls-performance.md
|           +-- CHANGELOG.md
|           \-- SKILL.md
+-- app/
|   +-- about/
|   |   \-- page.tsx
|   +-- account/
|   |   +-- booking-actions.ts
|   |   +-- loading.tsx
|   |   \-- page.tsx
|   +-- admin/
|   |   +-- availability/
|   |   |   \-- page.tsx
|   |   +-- bookings/
|   |   |   \-- page.tsx
|   |   +-- customers/
|   |   |   \-- page.tsx
|   |   +-- orders/
|   |   |   \-- page.tsx
|   |   +-- products/
|   |   |   \-- page.tsx
|   |   +-- services/
|   |   |   \-- page.tsx
|   |   +-- waitlist/
|   |   |   \-- page.tsx
|   |   +-- actions.ts
|   |   +-- error.tsx
|   |   +-- layout.tsx
|   |   +-- loading.tsx
|   |   \-- page.tsx
|   +-- api/
|   |   \-- stripe/
|   |       \-- webhook/
|   |           \-- route.ts
|   +-- auth/
|   |   +-- check-email/
|   |   |   \-- page.tsx
|   |   +-- confirm/
|   |   |   \-- route.ts
|   |   +-- confirmed/
|   |   |   \-- page.tsx
|   |   +-- reset-password/
|   |   |   \-- page.tsx
|   |   +-- actions.ts
|   |   +-- loading.tsx
|   |   \-- page.tsx
|   +-- booking/
|   |   +-- confirm/
|   |   |   \-- page.tsx
|   |   +-- confirmed/
|   |   |   \-- page.tsx
|   |   +-- time/
|   |   |   \-- page.tsx
|   |   +-- actions.ts
|   |   +-- page.tsx
|   |   \-- waitlist-actions.ts
|   +-- cart/
|   |   +-- actions.ts
|   |   \-- page.tsx
|   +-- checkout/
|   |   +-- confirmed/
|   |   |   \-- page.tsx
|   |   +-- actions.ts
|   |   +-- loading.tsx
|   |   \-- page.tsx
|   +-- forgot-password/
|   |   \-- page.tsx
|   +-- payment/
|   |   +-- cancelled/
|   |   |   \-- page.tsx
|   |   +-- success/
|   |   |   \-- page.tsx
|   |   \-- loading.tsx
|   +-- privacy/
|   |   \-- page.tsx
|   +-- product/
|   |   +-- [id]/
|   |   |   +-- loading.tsx
|   |   |   \-- page.tsx
|   |   +-- loading.tsx
|   |   \-- page.tsx
|   +-- profile/
|   |   +-- edit/
|   |   |   \-- page.tsx
|   |   +-- actions.ts
|   |   \-- loading.tsx
|   +-- terms/
|   |   \-- page.tsx
|   +-- training/
|   |   +-- actions.ts
|   |   \-- page.tsx
|   +-- error.tsx
|   +-- global-error.tsx
|   +-- globals.css
|   +-- layout.tsx
|   +-- not-found.tsx
|   +-- page.tsx
|   \-- template.tsx
+-- components/
|   +-- account/
|   |   +-- BookingActions.tsx
|   |   +-- CancelBookingButton.tsx
|   |   \-- CustomerDashboard.tsx
|   +-- admin/
|   |   +-- AdminConsole.tsx
|   |   +-- AdminDialog.tsx
|   |   +-- AdminNav.tsx
|   |   +-- AnalyticsPanel.tsx
|   |   +-- ApplicationsPanel.tsx
|   |   +-- AvailabilityPanel.tsx
|   |   +-- BookingsPanel.tsx
|   |   +-- BookingsTab.tsx
|   |   +-- CategoryField.tsx
|   |   +-- ConfirmButton.tsx
|   |   +-- CustomersPanel.tsx
|   |   +-- ExtraInfoEditor.tsx
|   |   +-- ImageField.tsx
|   |   +-- ImageThumbnails.tsx
|   |   +-- OrdersPanel.tsx
|   |   +-- ProductForm.tsx
|   |   +-- ProductsPanel.tsx
|   |   +-- ServiceForm.tsx
|   |   +-- ServicesPanel.tsx
|   |   +-- SettingsPanel.tsx
|   |   +-- shared.tsx
|   |   +-- StatusSelect.tsx
|   |   +-- StockEditor.tsx
|   |   +-- Table.tsx
|   |   +-- ui.ts
|   |   \-- WaitlistPanel.tsx
|   +-- auth/
|   |   +-- AuthActionShell.tsx
|   |   +-- AuthCardLayout.tsx
|   |   +-- AuthShell.tsx
|   |   +-- fields.tsx
|   |   +-- ForgotPasswordClient.tsx
|   |   +-- ForgotPasswordForm.tsx
|   |   +-- ResetPasswordClient.tsx
|   |   +-- ResetPasswordForm.tsx
|   |   +-- SignInForm.tsx
|   |   \-- SignUpForm.tsx
|   +-- booking/
|   |   +-- BookingShell.tsx
|   |   +-- BookingSteps.tsx
|   |   +-- BookingSummary.tsx
|   |   +-- ConfirmedStep.tsx
|   |   +-- ConfirmStep.tsx
|   |   +-- ServicesStep.tsx
|   |   +-- Stars.tsx
|   |   +-- TimeStep.tsx
|   |   \-- WaitlistCard.tsx
|   +-- cart/
|   |   \-- CartView.tsx
|   +-- checkout/
|   |   \-- CheckoutView.tsx
|   +-- common/
|   |   +-- CountrySelect.tsx
|   |   \-- PhoneInput.tsx
|   +-- home/
|   |   +-- About.tsx
|   |   +-- Carousel.tsx
|   |   +-- Hero.tsx
|   |   +-- Map.tsx
|   |   +-- Products.tsx
|   |   +-- SectionSkeleton.tsx
|   |   +-- SectionTitle.tsx
|   |   +-- Services.tsx
|   |   +-- ServicesList.tsx
|   |   +-- Social-Links.tsx
|   |   +-- Testimonials.tsx
|   |   \-- TrainingPopup.tsx
|   +-- legal/
|   |   +-- LegalPage.tsx
|   |   \-- TermsConsent.tsx
|   +-- payment/
|   |   \-- ClearAfterPayment.tsx
|   +-- product/
|   |   +-- ProductActions.tsx
|   |   \-- ProductGallery.tsx
|   +-- profile/
|   |   +-- EditProfileClient.tsx
|   |   \-- EditProfileForm.tsx
|   +-- shop/
|   |   +-- Pagination.tsx
|   |   \-- ShopView.tsx
|   +-- site/
|   |   +-- CartBadge.tsx
|   |   +-- CartMenu.tsx
|   |   +-- CheckoutSteps.tsx
|   |   +-- ErrorView.tsx
|   |   +-- Footer.tsx
|   |   +-- HeroLogic.ts
|   |   +-- Logo.tsx
|   |   +-- MobileSideBar.tsx
|   |   +-- Navbar.tsx
|   |   +-- NavLink.tsx
|   |   +-- nav-links.ts
|   |   +-- NavProgress.tsx
|   |   +-- ProductCard.tsx
|   |   +-- QtyStepper.tsx
|   |   +-- ScrollState.tsx
|   |   +-- StatusPage.tsx
|   |   \-- StatusPill.tsx
|   +-- training/
|   |   \-- ApplyForm.tsx
|   \-- ui/
|       +-- button.tsx
|       +-- carousel.tsx
|       +-- Reveal.tsx
|       +-- sheet.tsx
|       \-- Skeleton.tsx
+-- context/
|   +-- BookingContext.tsx
|   +-- CartContext.tsx
|   \-- cartContextDefinition.jsx
+-- Data/
|   +-- adminProducts.ts
|   +-- adminServices.ts
|   +-- analytics.js
|   +-- analytics.ts
|   +-- applications.ts
|   +-- auth.ts
|   +-- availability.ts
|   +-- blockedDates.ts
|   +-- bookings.ts
|   +-- customers.ts
|   +-- emailData.ts
|   +-- orders.ts
|   +-- payments.ts
|   +-- products.ts
|   +-- profile.ts
|   +-- services.ts
|   +-- settings.ts
|   +-- storage.ts
|   +-- vacancy.js
|   +-- waitlist.js
|   \-- waitlist.ts
+-- lib/
|   +-- admin/
|   |   +-- constants.ts
|   |   +-- extra-info.ts
|   |   +-- images.ts
|   |   +-- product-schema.ts
|   |   +-- result.ts
|   |   +-- schemas.ts
|   |   +-- service-schema.ts
|   |   +-- stock.ts
|   |   \-- upload.ts
|   +-- auth/
|   |   +-- actions.ts
|   |   +-- admin-data.ts
|   |   +-- api.ts
|   |   +-- dal.ts
|   |   +-- redirect.ts
|   |   +-- session.ts
|   |   \-- token.ts
|   +-- email/
|   |   +-- brand.ts
|   |   +-- notify.ts
|   |   +-- send.ts
|   |   \-- templates.ts
|   +-- schemas/
|   |   +-- application.ts
|   |   +-- auth.ts
|   |   +-- checkout.ts
|   |   +-- reset-password.ts
|   |   +-- settings.ts
|   |   \-- training.ts
|   +-- supabase/
|   |   +-- admin.ts
|   |   +-- client.ts
|   |   \-- server.ts
|   +-- analytics.ts
|   +-- booking.ts
|   +-- business.ts
|   +-- countries.ts
|   +-- date.ts
|   +-- delivery.ts
|   +-- delivery-options.ts
|   +-- format.ts
|   +-- hours.ts
|   +-- products.ts
|   +-- redirect-error.ts
|   +-- salon.ts
|   +-- services.ts
|   +-- statuses.ts
|   +-- stripe.ts
|   +-- testimonials.ts
|   \-- utils.ts
+-- public/
|   +-- favicon/
|   |   +-- android-chrome-192x192.png
|   |   +-- android-chrome-512x512.png
|   |   +-- apple-touch-icon.png
|   |   +-- favicon.ico
|   |   +-- favicon-16x16.png
|   |   +-- favicon-32x32.png
|   |   \-- site.webmanifest
|   +-- images/
|   |   +-- about-1.png
|   |   +-- about-2.png
|   |   +-- about-3.png
|   |   +-- gallery-1.jpg
|   |   +-- gallery-2.jpg
|   |   +-- gallery-3.jpg
|   |   +-- gallery-4.jpg
|   |   +-- hero.png
|   |   +-- no-image.svg
|   |   +-- product.png
|   |   +-- service-1.jpg
|   |   +-- service-2.jpg
|   |   +-- service-3.jpg
|   |   \-- service-4.jpg
|   \-- logo.png
+-- .env.example
+-- .env.local
+-- .gitignore
+-- AGENTS.md
+-- CLAUDE.md
+-- components.json
+-- eslint.config.mjs
+-- next.config.ts
+-- next-env.d.ts
+-- package.json
+-- package-lock.json
+-- postcss.config.mjs
+-- product.md
+-- PROJECT_STRUCTURE.md
+-- proxy.ts
+-- README.md
+-- skills-lock.json
+-- tsconfig.json
\-- tsconfig.tsbuildinfo
```
