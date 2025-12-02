# 🔒 Admin Lockdown Complete - PathGen v2

## ✅ Site Locked Until December 12, 2025

Only whitelisted admins can access the site until the official launch.

## 👑 Admin Whitelist

### By Discord Username:
- `crl_coach`
- `saltyzfn`

### By Discord UID:
- `lew1vMj8R0X7NKLcF9GJ9d0Khts2`

## 🔐 How It Works

### Access Control Logic

1. **Public Pages** (Always Accessible):
   - `/index.html` - Landing page
   - `/login.html` - Login page
   - `/setup.html` - Setup page

2. **Protected Pages** (Admin-only until Dec 12):
   - `/chat.html` - AI Coach
   - `/analyze.html` - Replay analyzer
   - `/tweets.html` - Live tweets
   - `/tournaments.html` - Tournaments
   - `/masterclass.html` - Masterclass
   - `/docs.html` - Documentation
   - `/settings.html` - Settings
   - `/admin-tracking.html` - Admin panel
   - All other pages

### Admin Check Priority

The system checks admin status in this order:

1. **Discord ID match** - Checks `ADMIN_UIDS` array
2. **Discord username match** - Checks `ADMIN_WHITELIST` array
3. **Firestore admin flag** - Checks `users/{uid}.isAdmin` or `users/{uid}.role === 'admin'`

### Non-Admin Experience

If a non-admin tries to access protected pages before Dec 12:
1. They see an alert: "PathGen v2 launches December 12, 2025. Only admins have early access."
2. They're redirected to `/index.html`

### Admin Experience

Admins get:
- ✅ Full access to all pages
- 👑 Gold "ADMIN" badge in navigation
- 📊 Admin Panel link in dropdown menu
- 🎮 Early access to all features

## 📋 Protected Pages List

All pages with admin guard:
```
apps/web/public/
├── chat.html ✅
├── analyze.html ✅
├── tweets.html ✅
├── tournaments.html ✅
├── masterclass.html ✅
├── docs.html ✅
├── settings.html ✅
└── admin-tracking.html ✅
```

## 🎯 Admin Panel

**URL**: `/admin-tracking.html`

### Features:
- Real-time user tracking
- Analytics dashboard
- User management
- System monitoring
- Only accessible to admins

## 🧪 Testing

### Test as Non-Admin:
1. Open incognito/private browser
2. Go to https://pathgen.dev/chat.html
3. Should show alert and redirect to index.html

### Test as Admin:
1. Login as `crl_coach` or `saltyzfn`
2. Go to any protected page
3. Should have full access
4. See 👑 ADMIN badge in navigation

## 🔧 Implementation Details

### Admin Guard Script

`/js/admin-guard.js` is included on all protected pages:

```javascript
const LAUNCH_DATE = new Date("2025-12-12T00:00:00Z");
const ADMIN_WHITELIST = ["crl_coach", "saltyzfn"];
const ADMIN_UIDS = ["lew1vMj8R0X7NKLcF9GJ9d0Khts2"];

// Checks localStorage for Discord user
// Checks Firestore for admin flag
// Enforces access control
// Shows admin badge if authorized
```

### How It's Included

At the end of each protected HTML page, after Firebase SDK:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="/firebase-config.js"></script>
<script src="/js/admin-guard.js"></script> <!-- Admin guard -->
```

## 📅 Launch Schedule

- **Now → Dec 11**: Admin-only access
- **Dec 12, 2025 00:00 UTC**: Public launch
- **After Dec 12**: Everyone can access

## 🚀 Deployment

All changes pushed to:
- GitHub: https://github.com/Velari-bot/PathGen-v2-Works
- Vercel: https://pathgen.dev

## ✅ Verification

After deployment, verify:
- [ ] Non-admins cannot access protected pages
- [ ] Admins can access all pages
- [ ] Admin badge shows for crl_coach and saltyzfn
- [ ] Admin Panel link appears in dropdown
- [ ] Public pages (index, login, setup) work for everyone

## 🔓 Post-Launch

After December 12, 2025:
- ✅ Site automatically unlocks
- ✅ All users can access all pages
- ✅ Admins still have admin badge and panel access
- ✅ No code changes needed!

The lockdown is time-based and will automatically lift on Dec 12! 🎉

