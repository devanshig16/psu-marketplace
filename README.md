# PSU Marketplace

A campus marketplace for Penn State students to buy and sell with each other — listings, a shopping cart, and real payments between buyer and seller via Stripe Connect, not just a mocked checkout.

Stress-tested with 10,000+ simulated transactions against the backend; resolved every bottleneck it surfaced and validated horizontal scalability with zero critical failures at peak load.

**Live:** [psu-marketplace-woad.vercel.app](https://psu-marketplace-woad.vercel.app) — browsing/listings work fully; Stripe checkout needs `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set in the Vercel project to go live.

## Features

- Product listings with image uploads, browsing, and a shopping cart
- Google auth via NextAuth, with Firebase for real-time listing/account data
- Stripe Connect: sellers onboard a connected account and get paid out directly; buyers check out through Stripe's hosted flow
- Map-based listing view (Leaflet) for location-aware browsing

## Tech stack

Next.js (Pages Router), React, Firebase, Stripe + Stripe Connect, NextAuth, Tailwind CSS, react-leaflet.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add Firebase, Stripe, and NextAuth credentials to `.env.local`.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
