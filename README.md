# HonorBox Webhook Relay on Railway

Deploy the official HonorBox Stripe webhook relay on Railway for near-instant private-repository fulfillment.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/honorbox-webhook-relay?referralCode=ZqgrJ0)

This repository packages the dependency-free relay from [Honorboxx/honorbox v0.5.1](https://github.com/Honorboxx/honorbox/releases/tag/v0.5.1) with a small Railway health-check adapter. It does not contain storefront products or fulfillment credentials.

## Required configuration

- `STRIPE_WEBHOOK_SECRET`: Stripe endpoint signing secret (`whsec_...`)
- `GITHUB_TOKEN`: fine-grained token restricted to the private ops repository, with Contents read/write
- `GITHUB_REPO`: private ops repository in `owner/name` form

The ops repository must contain HonorBox's `fulfill-on-sale.yml` workflow. Stripe should send `checkout.session.completed` and `checkout.session.async_payment_succeeded` events to the Railway domain.

The relay verifies Stripe signatures, rejects stale requests, and dispatches only an anonymized event reference. The scheduled HonorBox poll remains the safety net.

## Source and license

The relay is copied verbatim from HonorBox v0.5.1 under the MIT License. `server.mjs` only adds `/health` and binds the upstream handler to Railway's port.
