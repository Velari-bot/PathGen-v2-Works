// Admin Access Guard - Only allow whitelisted admins until December 12, 2025
// This file should be included on ALL pages to enforce access control

const LAUNCH_DATE = new Date("2025-12-12T00:00:00Z");
const ADMIN_WHITELIST = ["crl_coach", "saltyzfn"]; // Discord usernames
const ADMIN_UIDS = ["lew1vMj8R0X7NKLcF9GJ9d0Khts2"]; // Discord IDs

// Check if user is admin
async function isUserAdmin() {
  try {
    // Check localStorage for Discord user
    const discordUserStr = localStorage.getItem('discordUser');
    const pathgenUserStr = localStorage.getItem('pathgen_user');
    
    if (!discordUserStr && !pathgenUserStr) {
      return false;
    }
    
    // Check Discord username
    if (discordUserStr) {
      const discordUser = JSON.parse(discordUserStr);
      
      // Check by Discord ID
      if (ADMIN_UIDS.includes(discordUser.id)) {
        console.log('✅ Admin access granted: Discord ID match');
        return true;
      }
      
      // Check by Discord username
      if (ADMIN_WHITELIST.includes(discordUser.username)) {
        console.log('✅ Admin access granted: Username match');
        return true;
      }
    }
    
    // Check PathGen user
    if (pathgenUserStr) {
      const pathgenUser = JSON.parse(pathgenUserStr);
      
      if (ADMIN_UIDS.includes(pathgenUser.discordId)) {
        console.log('✅ Admin access granted: PathGen Discord ID match');
        return true;
      }
      
      if (ADMIN_WHITELIST.includes(pathgenUser.discordUsername)) {
        console.log('✅ Admin access granted: PathGen username match');
        return true;
      }
    }
    
    // Check Firestore for admin status
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      
      // Try to get user doc by Discord ID
      let userId = null;
      if (discordUserStr) {
        const discordUser = JSON.parse(discordUserStr);
        userId = discordUser.id;
      } else if (pathgenUserStr) {
        const pathgenUser = JSON.parse(pathgenUserStr);
        userId = pathgenUser.discordId;
      }
      
      if (userId) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.isAdmin || userData.role === 'admin') {
            console.log('✅ Admin access granted: Firestore admin flag');
            return true;
          }
        }
      }
    }
    
    console.log('❌ Admin access denied');
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Check if site should be locked (before launch date)
function isSiteLocked() {
  const now = new Date();
  return now < LAUNCH_DATE;
}

// Enforce access control
async function enforceAccessControl() {
  const currentPath = window.location.pathname;
  
  // Allow access to login and setup pages always
  const allowedPages = ['/login.html', '/setup.html', '/index.html'];
  if (allowedPages.includes(currentPath)) {
    console.log('✅ Public page - access allowed');
    return;
  }
  
  // Check if site is locked
  if (!isSiteLocked()) {
    console.log('✅ Site launched - access allowed for everyone');
    return;
  }
  
  // Site is locked - check if user is admin
  console.log('🔒 Site locked until Dec 12, 2025 - checking admin status...');
  const isAdmin = await isUserAdmin();
  
  if (!isAdmin) {
    console.log('❌ Access denied - redirecting to coming soon page');
    alert('PathGen v2 launches December 12, 2025. Only admins have early access.');
    window.location.href = '/index.html';
    return;
  }
  
  console.log('✅ Admin access granted - welcome!');
}

// Show admin badge if user is admin
async function showAdminBadge() {
  const isAdmin = await isUserAdmin();
  
  if (isAdmin) {
    // Add admin badge to user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo && !document.getElementById('adminBadge')) {
      const badge = document.createElement('span');
      badge.id = 'adminBadge';
      badge.textContent = '👑 ADMIN';
      badge.style.cssText = `
        padding: 4px 8px;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: #000;
        font-size: 10px;
        font-weight: 700;
        border-radius: 12px;
        margin-left: 8px;
        letter-spacing: 0.5px;
      `;
      userInfo.appendChild(badge);
    }
    
    // Add admin panel link to dropdown if not exists
    const settingsDropdown = document.getElementById('settingsDropdown');
    if (settingsDropdown && !document.getElementById('adminPanelLink')) {
      const adminLink = document.createElement('a');
      adminLink.id = 'adminPanelLink';
      adminLink.href = '/admin-tracking.html';
      adminLink.className = 'dropdown-item';
      adminLink.innerHTML = `
        <span class="dropdown-item-icon">👑</span>
        <span>Admin Panel</span>
      `;
      
      // Insert at the top of dropdown
      settingsDropdown.insertBefore(adminLink, settingsDropdown.firstChild);
      
      // Add divider
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';
      settingsDropdown.insertBefore(divider, adminLink.nextSibling);
    }
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await enforceAccessControl();
    await showAdminBadge();
  });
} else {
  (async () => {
    await enforceAccessControl();
    await showAdminBadge();
  })();
}

// Export for use in other scripts
window.isUserAdmin = isUserAdmin;
window.isSiteLocked = isSiteLocked;

