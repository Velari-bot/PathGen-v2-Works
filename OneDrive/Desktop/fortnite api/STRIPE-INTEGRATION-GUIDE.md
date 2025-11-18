# 💳 Stripe Payment Integration Guide

## 📋 Overview

This guide explains how Stripe payment processing works, including Checkout Sessions, webhooks, and the complete payment flow for PathGen subscriptions.

---

## 🔄 Complete Payment Flow

### **Step-by-Step Process:**

```
1. User clicks "Upgrade to Pro" button
   ↓
2. Frontend calls backend API: POST /api/stripe/create-checkout
   ↓
3. Backend creates Stripe Checkout Session
   ↓
4. Backend returns checkout URL to frontend
   ↓
5. Frontend redirects user to Stripe Checkout page
   ↓
6. User enters payment details on Stripe's secure page
   ↓
7. Stripe processes payment
   ↓
8. Stripe redirects user back to success/cancel URL
   ↓
9. Stripe sends webhook event to backend
   ↓
10. Backend verifies webhook and updates user subscription
```

---

## 🎯 Key Stripe Concepts

### **1. Checkout Session**

A Checkout Session is a Stripe-hosted payment page that handles:
- Payment method collection
- Payment processing
- 3D Secure authentication
- Multiple payment methods (cards, Apple Pay, Google Pay, etc.)

**Creating a Checkout Session:**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'subscription', // or 'payment' for one-time
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'PathGen Pro',
          description: 'AI coaching and replay analysis',
        },
        recurring: {
          interval: 'month',
        },
        unit_amount: 699, // $6.99 in cents
      },
      quantity: 1,
    },
  ],
  success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yourdomain.com/pricing?canceled=true',
  customer_email: userEmail, // Optional: pre-fill email
  metadata: {
    userId: userId, // Store user ID for webhook processing
    planType: 'pro',
  },
});
```

**Response:**
```javascript
{
  id: 'cs_test_...',
  url: 'https://checkout.stripe.com/pay/cs_test_...', // Redirect user here
  // ... other fields
}
```

---

### **2. Webhooks**

Webhooks are HTTP callbacks that Stripe sends to your server when events occur. They're **critical** for:
- Confirming payment completion
- Handling subscription updates
- Managing failed payments
- Syncing subscription status

**Important Webhook Events:**

| Event | When It Fires | What to Do |
|-------|---------------|-----------|
| `checkout.session.completed` | User completes checkout | Activate subscription, grant access |
| `customer.subscription.created` | New subscription created | Store subscription ID, update user |
| `customer.subscription.updated` | Subscription changed | Update plan, limits, features |
| `customer.subscription.deleted` | Subscription canceled | Revoke access, downgrade to free |
| `invoice.payment_succeeded` | Monthly payment succeeded | Renew subscription, send receipt |
| `invoice.payment_failed` | Payment failed | Notify user, retry payment |
| `payment_intent.succeeded` | One-time payment succeeded | Grant access, fulfill order |

---

### **3. Webhook Security (CRITICAL)**

**Always verify webhook signatures!** This ensures the request is actually from Stripe.

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

// Use raw body for signature verification
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify the signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Activate subscription
      await activateUserSubscription(session);
      break;
    
    case 'customer.subscription.created':
      const subscription = event.data.object;
      // Store subscription details
      await storeSubscription(subscription);
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Renew subscription
      await renewSubscription(invoice);
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Handle failed payment
      await handleFailedPayment(failedInvoice);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Always return 200 to acknowledge receipt
  res.json({ received: true });
});
```

**Getting Webhook Secret:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Create endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen for
4. Copy the "Signing secret" (starts with `whsec_...`)
5. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🏗️ Implementation Architecture

### **Backend API Endpoints Needed:**

#### **1. Create Checkout Session**
```
POST /api/stripe/create-checkout
Body: {
  planType: 'pro',
  userId: 'user123',
  userEmail: 'user@example.com'
}
Response: {
  checkoutUrl: 'https://checkout.stripe.com/...',
  sessionId: 'cs_test_...'
}
```

#### **2. Webhook Handler**
```
POST /api/stripe/webhook
Headers: {
  'stripe-signature': '...'
}
Body: <Stripe Event JSON>
Response: { received: true }
```

#### **3. Check Session Status** (Optional)
```
GET /api/stripe/session/:sessionId
Response: {
  status: 'complete' | 'open' | 'expired',
  customerId: 'cus_...',
  subscriptionId: 'sub_...'
}
```

---

## 📝 Implementation Steps

### **Step 1: Install Stripe SDK**

```bash
npm install stripe
```

### **Step 2: Environment Variables**

Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_... # Test key, use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # For frontend (if needed)
STRIPE_WEBHOOK_SECRET=whsec_... # From webhook endpoint settings
```

### **Step 3: Create Checkout Session Endpoint**

```javascript
// fortnite-core/packages/api/src/index.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia', // Use latest API version
});

app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { planType, userId, userEmail } = req.body;

    // Validate input
    if (!planType || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Define pricing based on plan
    const priceMap = {
      pro: {
        amount: 699, // $6.99 in cents
        name: 'PathGen Pro',
        description: 'AI coaching and replay analysis',
      },
      // Add other plans here
    };

    const plan = priceMap[planType];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planType: planType,
      },
    });

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

### **Step 4: Webhook Handler**

```javascript
// fortnite-core/packages/api/src/index.ts

// IMPORTANT: Use raw body parser for webhook endpoint only
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get subscription ID if it's a subscription
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const userId = session.metadata?.userId;

        if (userId && subscriptionId) {
          // Activate subscription in Firebase
          await activateSubscription(userId, subscriptionId, customerId, session.metadata?.planType);
        }

        console.log('✅ Checkout completed:', session.id);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await storeSubscriptionDetails(userId, subscription);
        }

        console.log('✅ Subscription created:', subscription.id);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateSubscription(userId, subscription);
        }

        console.log('✅ Subscription updated:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await cancelSubscription(userId);
        }

        console.log('✅ Subscription canceled:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await renewSubscription(subscriptionId);
        }

        console.log('✅ Payment succeeded:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Notify user of failed payment
        await handleFailedPayment(customerId, invoice);

        console.log('⚠️ Payment failed:', invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

### **Step 5: Firebase Helper Functions**

```javascript
// Helper functions to update Firebase

async function activateSubscription(userId: string, subscriptionId: string, customerId: string, planType: string) {
  // Update Firebase user document
  const subscription = {
    type: planType,
    plan: planType,
    price: 6.99,
    startDate: new Date().toISOString(),
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    status: 'active',
    limits: {
      messagesPerMonth: 2500,
      replayUploadsPerMonth: 100,
      tournamentStrategiesPerMonth: 200,
      analytics: 'unlimited',
      realTimeCoaching: true,
      ads: false,
      prioritySupport: true,
    },
  };

  // Update in Firebase (you'll need to implement Firebase admin SDK)
  // await admin.firestore().collection('users').doc(userId).set({
  //   subscription: subscription,
  //   updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  // }, { merge: true });
}

async function cancelSubscription(userId: string) {
  // Downgrade to free plan
  const subscription = {
    type: 'free',
    plan: 'free',
    price: 0,
    status: 'canceled',
    canceledAt: new Date().toISOString(),
    limits: {
      messagesPerMonth: 75,
      replayUploadsPerMonth: 5,
      tournamentStrategiesPerMonth: 10,
      analytics: 'basic',
      realTimeCoaching: false,
      ads: true,
      prioritySupport: false,
    },
  };

  // Update in Firebase
  // await admin.firestore().collection('users').doc(userId).set({
  //   subscription: subscription,
  //   updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  // }, { merge: true });
}
```

### **Step 6: Update Frontend**

```javascript
// apps/web/public/pricing.html

async function startSubscription() {
  try {
    // Get user info
    const userDataStr = localStorage.getItem('pathgen_user');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const userId = userData?.id || userData?.email || 'anonymous';
    const userEmail = userData?.email;

    // Call backend to create checkout session
    const response = await fetch('http://localhost:4000/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType: 'pro',
        userId: userId,
        userEmail: userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = data.checkoutUrl;
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to start checkout. Please try again.');
  }
}
```

### **Step 7: Success Page**

```html
<!-- apps/web/public/success.html -->

<script>
  // Get session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  if (sessionId) {
    // Verify session status with backend
    fetch(`http://localhost:4000/api/stripe/session/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'complete') {
          // Subscription activated via webhook
          // Show success message
          // Redirect to chat after 3 seconds
          setTimeout(() => {
            window.location.href = '/chat.html';
          }, 3000);
        }
      });
  }
</script>
```

---

## 🔒 Security Best Practices

1. **Always verify webhook signatures** - Never skip this!
2. **Use HTTPS** - Required for webhooks in production
3. **Store secrets securely** - Use environment variables, never commit to git
4. **Handle idempotency** - Same event may be sent multiple times
5. **Validate user input** - Check userId, planType before processing
6. **Log all webhook events** - For debugging and audit trails
7. **Use test mode first** - Test with `sk_test_...` before going live

---

## 🧪 Testing

### **Test Mode:**
- Use `sk_test_...` secret key
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:4000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

---

## 📊 Monitoring

**Stripe Dashboard:**
- View all payments, subscriptions, customers
- Monitor webhook delivery and failures
- View logs and events
- Test webhook endpoints

**Your Backend:**
- Log all webhook events
- Track subscription activations
- Monitor failed payments
- Alert on webhook failures

---

## 🚀 Production Checklist

- [ ] Switch to `sk_live_...` secret key
- [ ] Update webhook endpoint URL to production domain
- [ ] Test webhook signature verification
- [ ] Set up webhook retry handling
- [ ] Configure proper error handling
- [ ] Set up monitoring/alerts
- [ ] Test subscription cancellation flow
- [ ] Test payment failure handling
- [ ] Verify Firebase updates work correctly
- [ ] Test with real payment methods (small amounts)

---

## 📚 Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

---

## 🎯 Summary

**Key Takeaways:**
1. User clicks pay → Backend creates Checkout Session → Redirects to Stripe
2. Stripe processes payment → Redirects back to success page
3. Stripe sends webhook → Backend verifies signature → Updates Firebase
4. Always verify webhook signatures for security
5. Handle all subscription lifecycle events (created, updated, deleted, payment succeeded/failed)

This flow ensures secure, reliable payment processing with proper subscription management! 🎉

