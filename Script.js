// ========================================
// FF Wishlist Manager - Complete JavaScript
// ========================================

// Global State
const APP_STATE = {
    currentAccount: null,
    wishlistItems: [],
    itemDatabase: [],
    activityHistory: [],
    currentFilter: 'all',
    isOnline: true
};

// Free Fire Item Database
const FF_ITEMS = {
    weapons: [
        { id: 'cobra_rage', name: 'Cobra Rage AK-47', type: 'weapon', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Cobra+Rage+AK' },
        { id: 'dragon_ak', name: 'Dragon AK-47', type: 'weapon', rarity: 'epic', image: 'https://via.placeholder.com/300?text=Dragon+AK' },
        { id: 'flame_thrower', name: 'Flame Thrower', type: 'weapon', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Flame+Thrower' },
        { id: 'frost_blade', name: 'Frost Blade', type: 'weapon', rarity: 'epic', image: 'https://via.placeholder.com/300?text=Frost+Blade' },
        { id: 'thunder_strike', name: 'Thunder Strike M4', type: 'weapon', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Thunder+Strike' },
        { id: 'shadow_reaper', name: 'Shadow Reaper Sniper', type: 'weapon', rarity: 'epic', image: 'https://via.placeholder.com/300?text=Shadow+Reaper' }
    ],
    skins: [
        { id: 'angel_pants', name: 'Angel Pants', type: 'skin', rarity: 'rare', image: 'https://via.placeholder.com/300?text=Angel+Pants' },
        { id: 'criminal_bundle', name: 'Criminal Bundle', type: 'skin', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Criminal+Bundle' },
        { id: 'elite_pass', name: 'Elite Pass Skin', type: 'skin', rarity: 'epic', image: 'https://via.placeholder.com/300?text=Elite+Pass' },
        { id: 'diamond_royale', name: 'Diamond Royale Set', type: 'skin', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Diamond+Royale' },
        { id: 'gold_armor', name: 'Golden Armor Set', type: 'skin', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Gold+Armor' }
    ],
    bundles: [
        { id: 'phoenix_bundle', name: 'Phoenix Bundle', type: 'bundle', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Phoenix+Bundle' },
        { id: 'cyber_warrior', name: 'Cyber Warrior Bundle', type: 'bundle', rarity: 'epic', image: 'https://via.placeholder.com/300?text=Cyber+Warrior' },
        { id: 'ninja_master', name: 'Ninja Master Bundle', type: 'bundle', rarity: 'epic', image: 'https://via.placeholder.com/300?text=Ninja+Master' },
        { id: 'pirate_king', name: 'Pirate King Bundle', type: 'bundle', rarity: 'legendary', image: 'https://via.placeholder.com/300?text=Pirate+King' }
    ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 FF Wishlist Manager Starting...');
    
    // Show loading screen
    showLoadingScreen();
    
    // Initialize components
    await initializeApp();
    
    // Hide loading screen
    setTimeout(() => {
        hideLoadingScreen();
        showToast('✅ Hệ thống đã sẵn sàng!', 'success');
    }, 2000);
});

// Show/Hide Loading Screen
function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        document.getElementById('app').style.display = 'flex';
    }, 500);
}

// Initialize App
async function initializeApp() {
    // Load saved data
    loadAllData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Initialize item database
    initializeItemDatabase();
    
    // Render initial state
    renderWishlist();
    updateAccountDisplay();
    
    // Setup auto-save
    setupAutoSave();
    
    // Check server status
    await checkServerStatus();
    
    console.log('✅ App initialized successfully');
}

// Load All Saved Data
function loadAllData() {
    // Load current account
    const savedAccount = localStorage.getItem('ff_current_account');
    if (savedAccount) {
        APP_STATE.currentAccount = JSON.parse(savedAccount);
    }
    
    // Load wishlist
    const savedWishlist = localStorage.getItem('ff_wishlist');
    if (savedWishlist) {
        APP_STATE.wishlistItems = JSON.parse(savedWishlist);
    }
    
    // Load history
    const savedHistory = localStorage.getItem('ff_history');
    if (savedHistory) {
        APP_STATE.activityHistory = JSON.parse(savedHistory);
    }
    
    // Load guest data
    const savedGuest = localStorage.getItem('ff_guest_data');
    if (savedGuest) {
        const guestData = JSON.parse(savedGuest);
        document.getElementById('guestUID').textContent = guestData.uid;
        document.getElementById('guestPassword').textContent = guestData.password;
        document.getElementById('guestNickname').textContent = guestData.nickname;
        document.getElementById('guestLevel').textContent = guestData.level || 'N/A';
        document.getElementById('guestInfo').style.display = 'block';
    }
    
    // Load manual data
    const savedManual = localStorage.getItem('ff_manual_data');
    if (savedManual) {
        const manualData = JSON.parse(savedManual);
        document.getElementById('manualUID').value = manualData.uid;
        document.getElementById('manualPassword').value = manualData.password;
        document.getElementById('manualNickname').value = manualData.nickname;
        if (manualData.server) {
            document.getElementById('serverSelect').value = manualData.server;
        }
    }
    
    console.log('📦 Data loaded successfully');
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // File upload
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Manual form auto-detect
    document.getElementById('manualUID').addEventListener('input', autoDetectManual);
    document.getElementById('manualPassword').addEventListener('input', autoDetectManual);
    
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Item link preview
    document.getElementById('itemLink').addEventListener('input', previewItemFromLink);
    
    // Remember toggles
    document.getElementById('rememberGuest').addEventListener('change', function() {
        if (this.checked && APP_STATE.currentAccount) {
            saveGuestData();
        } else {
            localStorage.removeItem('ff_guest_data');
        }
    });
    
    document.getElementById('rememberManual').addEventListener('change', function() {
        if (this.checked) {
            saveManualData();
        } else {
            localStorage.removeItem('ff_manual_data');
        }
    });
}

// Setup Drag and Drop
function setupDragAndDrop() {
    const uploadZone = document.getElementById('uploadZone');
    
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    });
}

// Setup Auto Save
function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        saveAllData();
    }, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        saveAllData();
    });
}

// Save All Data
function saveAllData() {
    if (APP_STATE.currentAccount) {
        localStorage.setItem('ff_current_account', JSON.stringify(APP_STATE.currentAccount));
    }
    
    if (APP_STATE.wishlistItems.length > 0) {
        localStorage.setItem('ff_wishlist', JSON.stringify(APP_STATE.wishlistItems));
    }
    
    if (APP_STATE.activityHistory.length > 0) {
        localStorage.setItem('ff_history', JSON.stringify(APP_STATE.activityHistory));
    }
}

// Navigation
function navigateTo(page) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    const pageMap = {
        'account': 'accountPage',
        'wishlist': 'wishlistPage',
        'items': 'itemsPage',
        'history': 'historyPage'
    };
    
    const targetPage = document.getElementById(pageMap[page]);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        if (page === 'items') loadItemsDatabase();
        if (page === 'history') loadHistory();
        if (page === 'wishlist') renderWishlist();
    }
    
    // Add to history
    addActivity(`Chuyển đến trang: ${page}`);
}

// Switch to Wishlist
function switchToWishlist() {
    navigateTo('wishlist');
    updateAccountDisplay();
    showToast('✅ Đã chuyển sang Wishlist!', 'success');
}

// Switch to Account
function switchToAccount() {
    navigateTo('account');
}

// Handle File Upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Process File
function processFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            let data;
            
            // Try to parse JSON
            try {
                data = JSON.parse(content);
            } catch {
                // Try to extract from text
                data = extractAccountFromText(content);
            }
            
            if (data && data.guest_account_info) {
                const guestInfo = data.guest_account_info;
                const uid = guestInfo['com.garena.msdk.guest_uid'] || 
                           guestInfo.guest_uid || 
                           Object.values(guestInfo)[0];
                const password = guestInfo['com.garena.msdk.guest_password'] || 
                               guestInfo.guest_password || 
                               Object.values(guestInfo)[1];
                
                if (uid && password) {
                    // Generate nickname and level
                    const nickname = generateFFNickname(uid);
                    const level = Math.floor(Math.random() * 50) + 30;
                    
                    // Update UI
                    document.getElementById('guestUID').textContent = uid;
                    document.getElementById('guestPassword').textContent = password;
                    document.getElementById('guestNickname').textContent = nickname;
                    document.getElementById('guestLevel').textContent = level;
                    document.getElementById('guestInfo').style.display = 'block';
                    
                    // Set as current account
                    APP_STATE.currentAccount = {
                        uid: uid,
                        password: password,
                        nickname: nickname,
                        level: level,
                        server: 'vn',
                        source: 'guest',
                        timestamp: new Date().toISOString()
                    };
                    
                    // Save if remember is enabled
                    if (document.getElementById('rememberGuest').checked) {
                        saveGuestData();
                    }
                    
                    addActivity(`Import tài khoản khách: ${nickname} (${uid})`);
                    showToast('✅ File đã được xử lý thành công!', 'success');
                    
                    // Auto switch to wishlist after 1 second
                    setTimeout(() => switchToWishlist(), 1000);
                }
            } else {
                showToast('❌ File không đúng định dạng!', 'error');
            }
        } catch (error) {
            showToast('❌ Lỗi xử lý file: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// Extract Account from Text
function extractAccountFromText(text) {
    const uidMatch = text.match(/(?:guest_uid|uid)["\s:=]+(\d+)/i);
    const passMatch = text.match(/(?:guest_password|password)["\s:=]+([^\s"'}]+)/i);
    
    if (uidMatch && passMatch) {
        return {
            guest_account_info: {
                'com.garena.msdk.guest_uid': uidMatch[1],
                'com.garena.msdk.guest_password': passMatch[1]
            }
        };
    }
    
    return null;
}

// Generate FF Nickname
function generateFFNickname(uid) {
    const prefixes = ['Pro', 'Master', 'King', 'Legend', 'Star', 'Hero', 'Ace', 'Lord', 'Demon', 'Ghost'];
    const suffixes = ['Gaming', 'FF', 'VN', 'No1', 'Top', 'Best', 'Elite', 'Pro'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const uidShort = uid.toString().slice(-4);
    return `${randomPrefix}_${randomSuffix}${uidShort}`;
}

// Auto Detect Manual Input
function autoDetectManual() {
    const uid = document.getElementById('manualUID').value.trim();
    const password = document.getElementById('manualPassword').value.trim();
    
    if (uid && password) {
        const nickname = generateFFNickname(uid);
        document.getElementById('manualNickname').value = nickname;
    }
}

// Process Guest Account
function processGuestAccount() {
    if (!APP_STATE.currentAccount || APP_STATE.currentAccount.source !== 'guest') {
        showToast('❌ Vui lòng import file .dat trước!', 'error');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('ff_current_account', JSON.stringify(APP_STATE.currentAccount));
    
    addActivity(`Đăng nhập tài khoản khách: ${APP_STATE.currentAccount.nickname}`);
    showToast('🚀 Đăng nhập thành công!', 'success');
    
    // Switch to wishlist
    setTimeout(() => switchToWishlist(), 500);
}

// Process Manual Account
function processManualAccount() {
    const uid = document.getElementById('manualUID').value.trim();
    const password = document.getElementById('manualPassword').value.trim();
    const nickname = document.getElementById('manualNickname').value.trim();
    const server = document.getElementById('serverSelect').value;
    
    if (!uid || !password) {
        showToast('❌ Vui lòng nhập đầy đủ UID và Password!', 'error');
        return;
    }
    
    // Set current account
    APP_STATE.currentAccount = {
        uid: uid,
        password: password,
        nickname: nickname || generateFFNickname(uid),
        server: server,
        level: Math.floor(Math.random() * 50) + 30,
        source: 'manual',
        timestamp: new Date().toISOString()
    };
    
    // Save if remember is enabled
    if (document.getElementById('rememberManual').checked) {
        saveManualData();
    }
    
    localStorage.setItem('ff_current_account', JSON.stringify(APP_STATE.currentAccount));
    
    addActivity(`Đăng nhập thủ công: ${APP_STATE.currentAccount.nickname} (${uid})`);
    showToast('🚀 Đăng nhập thành công!', 'success');
    
    // Switch to wishlist
    setTimeout(() => switchToWishlist(), 500);
}

// Save Guest Data
function saveGuestData() {
    if (APP_STATE.currentAccount && APP_STATE.currentAccount.source === 'guest') {
        localStorage.setItem('ff_guest_data', JSON.stringify(APP_STATE.currentAccount));
    }
}

// Save Manual Data
function saveManualData() {
    const uid = document.getElementById('manualUID').value;
    const password = document.getElementById('manualPassword').value;
    const nickname = document.getElementById('manualNickname').value;
    const server = document.getElementById('serverSelect').value;
    
    if (uid && password) {
        localStorage.setItem('ff_manual_data', JSON.stringify({
            uid, password, nickname, server
        }));
    }
}

// Update Account Display
function updateAccountDisplay() {
    const accountCard = document.getElementById('currentAccountCard');
    const nickname = document.getElementById('bannerNickname');
    const uid = document.getElementById('bannerUID');
    const server = document.getElementById('bannerServer');
    
    if (APP_STATE.currentAccount) {
        accountCard.style.display = 'block';
        nickname.textContent = APP_STATE.currentAccount.nickname;
        uid.textContent = APP_STATE.currentAccount.uid;
        server.textContent = APP_STATE.currentAccount.server || 'VN';
    } else {
        accountCard.style.display = 'none';
    }
}

// Initialize Item Database
function initializeItemDatabase() {
    APP_STATE.itemDatabase = [
        ...FF_ITEMS.weapons,
        ...FF_ITEMS.skins,
        ...FF_ITEMS.bundles
    ];
}

// Add to Wishlist
function addToWishlist() {
    const itemLink = document.getElementById('itemLink').value.trim();
    let itemData = null;
    
    if (itemLink) {
        // Extract item ID from link
        const itemId = extractItemIdFromLink(itemLink);
        if (itemId) {
            // Find in database
            itemData = APP_STATE.itemDatabase.find(item => item.id === itemId);
            if (!itemData) {
                itemData = {
                    id: itemId,
                    name: `Item ${itemId}`,
                    type: 'unknown',
                    rarity: 'common',
                    image: `https://via.placeholder.com/300?text=Item+${itemId}`
                };
            }
        }
    }
    
    if (!itemData) {
        showToast('❌ Vui lòng nhập link item hợp lệ hoặc chọn từ danh sách!', 'error');
        return;
    }
    
    // Check if already in wishlist
    if (APP_STATE.wishlistItems.find(item => item.id === itemData.id)) {
        showToast('⚠️ Item này đã có trong wishlist!', 'warning');
        return;
    }
    
    // Add to wishlist
    const wishlistItem = {
        ...itemData,
        addedBy: APP_STATE.currentAccount?.nickname || 'Unknown',
        addedByUID: APP_STATE.currentAccount?.uid || 'Unknown',
        addedAt: new Date().toISOString(),
        priority: 'normal'
    };
    
    APP_STATE.wishlistItems.push(wishlistItem);
    saveAllData();
    renderWishlist();
    
    // Clear input
    document.getElementById('itemLink').value = '';
    document.getElementById('itemPreview').style.display = 'none';
    
    addActivity(`Thêm item vào wishlist: ${itemData.name}`);
    showToast(`✅ Đã thêm ${itemData.name} vào wishlist!`, 'success');
}

// Extract Item ID from Link
function extractItemIdFromLink(link) {
    try {
        const url = new URL(link);
        return url.searchParams.get('id') || url.searchParams.get('item');
    } catch {
        const match = link.match(/[?&]id=([^&]+)/);
        return match ? match[1] : null;
    }
}

// Preview Item from Link
function previewItemFromLink() {
    const link = document.getElementById('itemLink').value.trim();
    const preview = document.getElementById('itemPreview');
    
    if (!link) {
        preview.style.display = 'none';
        return;
    }
    
    const itemId = extractItemIdFromLink(link);
    if (!itemId) {
        preview.style.display = 'none';
        return;
    }
    
    const itemData = APP_STATE.itemDatabase.find(item => item.id === itemId);
    if (itemData) {
        document.getElementById('previewImage').src = itemData.image;
        document.getElementById('previewName').textContent = itemData.name;
        document.getElementById('previewId').textContent = `ID: ${itemData.id}`;
        document.getElementById('previewRarity').textContent = `Độ hiếm: ${itemData.rarity}`;
        preview.style.display = 'flex';
    }
}

// Select Popular Item
function selectPopularItem() {
    const select = document.getElementById('popularItems');
    const selectedId = select.value;
    
    if (!selectedId) return;
    
    const itemData = APP_STATE.itemDatabase.find(item => item.id === selectedId);
    if (itemData) {
        document.getElementById('itemLink').value = `https://ff-item.netlify.app/?id=${itemData.id}`;
        document.getElementById('previewImage').src = itemData.image;
        document.getElementById('previewName').textContent = itemData.name;
        document.getElementById('previewId').textContent = `ID: ${itemData.id}`;
        document.getElementById('previewRarity').textContent = `Độ hiếm: ${itemData.rarity}`;
        document.getElementById('itemPreview').style.display = 'flex';
    }
}

// Delete Specific Item
function deleteSpecificItem() {
    const itemId = document.getElementById('deleteItemId').value.trim();
    
    if (!itemId) {
        showToast('⚠️ Vui lòng nhập ID item hoặc dùng nút "Xóa Tất Cả"!', 'warning');
        return;
    }
    
    const index = APP_STATE.wishlistItems.findIndex(item => item.id === itemId);
    
    if (index === -1) {
        showToast('❌ Không tìm thấy item với ID này!', 'error');
        return;
    }
    
    const itemName = APP_STATE.wishlistItems[index].name;
    
    showModal(
        'Xác Nhận Xóa',
        `Bạn có chắc muốn xóa item "${itemName}" (ID: ${itemId})?`,
        () => {
            APP_STATE.wishlistItems.splice(index, 1);
            saveAllData();
            renderWishlist();
            document.getElementById('deleteItemId').value = '';
            addActivity(`Xóa item khỏi wishlist: ${itemName}`);
            showToast('✅ Đã xóa item thành công!', 'success');
        }
    );
}

// Delete All Items
function deleteAllItems() {
    if (APP_STATE.wishlistItems.length === 0) {
        showToast('📋 Danh sách wishlist đã trống!', 'info');
        return;
    }
    
    showModal(
        'Xác Nhận Xóa Tất Cả',
        `Bạn có chắc muốn xóa TẤT CẢ ${APP_STATE.wishlistItems.length} item trong wishlist?`,
        () => {
            APP_STATE.wishlistItems = [];
            saveAllData();
            renderWishlist();
            addActivity('Xóa tất cả item khỏi wishlist');
            showToast('✅ Đã xóa tất cả item!', 'success');
        }
    );
}

// Remove Single Item
function removeItem(itemId) {
    const item = APP_STATE.wishlistItems.find(i => i.id === itemId);
    if (!item) return;
    
    showModal(
        'Xác Nhận Xóa',
        `Xóa item "${item.name}" khỏi wishlist?`,
        () => {
            APP_STATE.wishlistItems = APP_STATE.wishlistItems.filter(i => i.id !== itemId);
            saveAllData();
            renderWishlist();
            addActivity(`Xóa item: ${item.name}`);
            showToast('✅ Đã xóa item!', 'success');
        }
    );
}

// Filter Items
function filterItems(filter) {
    APP_STATE.currentFilter = filter;
    renderWishlist();
}

// Render Wishlist
function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    const totalItems = document.getElementById('totalItems');
    const rareItems = document.getElementById('rareItems');
    const estimatedValue = document.getElementById('estimatedValue');
    
    // Filter items
    let items = APP_STATE.wishlistItems;
    if (APP_STATE.currentFilter !== 'all') {
        items = items.filter(item => item.type === APP_STATE.currentFilter);
    }
    
    // Update stats
    totalItems.textContent = APP_STATE.wishlistItems.length;
    rareItems.textContent = APP_STATE.wishlistItems.filter(i => i.rarity === 'legendary' || i.rarity === 'epic').length;
    estimatedValue.textContent = APP_STATE.wishlistItems.length * 100;
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Chưa có item nào</h3>
                <p>Thêm item từ link hoặc chọn từ danh sách phổ biến</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="wishlist-item">
            <button class="remove-btn" onclick="removeItem('${item.id}')">
                <i class="fas fa-times"></i>
            </button>
            <div class="item-image-container">
                <span class="item-rarity-badge rarity-${item.rarity}">${item.rarity}</span>
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            </div>
            <div class="item-content">
                <div class="item-name">${item.name}</div>
                <div class="item-id">ID: ${item.id}</div>
                <div class="item-meta">
                    <span>👤 ${item.addedBy}</span>
                    <span>🎮 ${item.addedByUID}</span>
                </div>
                <div class="item-meta" style="margin-top: 5px; font-size: 11px;">
                    <span>📅 ${new Date(item.addedAt).toLocaleDateString('vi-VN')}</span>
                    <span>⭐ ${item.priority}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Items Database
function loadItemsDatabase() {
    const grid = document.getElementById('itemsGrid');
    
    grid.innerHTML = APP_STATE.itemDatabase.map(item => `
        <div class="wishlist-item">
            <div class="item-image-container">
                <span class="item-rarity-badge rarity-${item.rarity}">${item.rarity}</span>
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-content">
                <div class="item-name">${item.name}</div>
                <div class="item-id">ID: ${item.id}</div>
                <div class="item-meta">
                    <span>📦 ${item.type}</span>
                    <button class="btn btn-sm btn-primary" onclick="quickAddToWishlist('${item.id}')">
                        <i class="fas fa-plus"></i> Thêm
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Quick Add to Wishlist
function quickAddToWishlist(itemId) {
    const itemData = APP_STATE.itemDatabase.find(item => item.id === itemId);
    if (!itemData) return;
    
    if (APP_STATE.wishlistItems.find(item => item.id === itemId)) {
        showToast('⚠️ Item đã có trong wishlist!', 'warning');
        return;
    }
    
    const wishlistItem = {
        ...itemData,
        addedBy: APP_STATE.currentAccount?.nickname || 'Unknown',
        addedByUID: APP_STATE.currentAccount?.uid || 'Unknown',
        addedAt: new Date().toISOString(),
        priority: 'normal'
    };
    
    APP_STATE.wishlistItems.push(wishlistItem);
    saveAllData();
    addActivity(`Thêm nhanh item: ${itemData.name}`);
    showToast(`✅ Đã thêm ${itemData.name} vào wishlist!`, 'success');
}

// Load History
function loadHistory() {
    const list = document.getElementById('historyList');
    
    if (APP_STATE.activityHistory.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>Chưa có hoạt động nào</h3>
            </div>
        `;
        return;
    }
    
    list.innerHTML = APP_STATE.activityHistory.slice().reverse().map(activity => `
        <div class="card" style="margin-bottom: 10px;">
            <div class="card-body" style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <i class="fas fa-circle text-success" style="font-size: 8px;"></i>
                        <span style="color: var(--white); margin-left: 10px;">${activity.action}</span>
                    </div>
                    <span style="color: rgba(255,255,255,0.5); font-size: 12px;">${activity.timestamp}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Add Activity
function addActivity(action) {
    APP_STATE.activityHistory.push({
        action: action,
        timestamp: new Date().toLocaleString('vi-VN')
    });
    
    // Limit history to 100 items
    if (APP_STATE.activityHistory.length > 100) {
        APP_STATE.activityHistory = APP_STATE.activityHistory.slice(-100);
    }
    
    saveAllData();
}

// Handle Search
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (!query) {
        renderWishlist();
        return;
    }
    
    const filtered = APP_STATE.wishlistItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.addedBy.toLowerCase().includes(query) ||
        item.addedByUID.includes(query)
    );
    
    const grid = document.getElementById('wishlistGrid');
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy kết quả</h3>
                <p>Thử tìm kiếm với từ khóa khác</p>
            </div>
        `;
    } else {
        // Temporarily replace wishlist for search
        const originalWishlist = APP_STATE.wishlistItems;
        APP_STATE.wishlistItems = filtered;
        renderWishlist();
        APP_STATE.wishlistItems = originalWishlist;
    }
}

// Sync Data
async function syncData() {
    showToast('🔄 Đang đồng bộ dữ liệu...', 'info');
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    saveAllData();
    addActivity('Đồng bộ dữ liệu');
    showToast('✅ Đồng bộ thành công!', 'success');
}

// Export Data
function exportData() {
    const data = {
        account: APP_STATE.currentAccount,
        wishlist: APP_STATE.wishlistItems,
        history: APP_STATE.activityHistory,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ff-wishlist-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addActivity('Xuất dữ liệu');
    showToast('✅ Dữ liệu đã được xuất!', 'success');
}

// Toggle Password Visibility
function togglePassword() {
    const input = document.getElementById('manualPassword');
    const icon = event.target.closest('button').querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check Server Status
async function checkServerStatus() {
    try {
        // Simulate server check
        await new Promise(resolve => setTimeout(resolve, 1000));
        APP_STATE.isOnline = true;
        
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.server-status span:last-child');
        
        if (statusDot && statusText) {
            statusDot.classList.add('online');
            statusText.textContent = 'Server: Online';
        }
    } catch (error) {
        APP_STATE.isOnline = false;
        
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.server-status span:last-child');
        
        if (statusDot && statusText) {
            statusDot.classList.remove('online');
            statusText.textContent = 'Server: Offline';
        }
    }
}

// Show Toast
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span style="margin-left: 10px;">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show Modal
function showModal(title, message, onConfirm) {
    const container = document.getElementById('modalContainer');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const footerEl = document.getElementById('modalFooter');
    
    titleEl.textContent = title;
    bodyEl.innerHTML = `<p>${message}</p>`;
    footerEl.innerHTML = `
        <button class="btn btn-outline" onclick="closeModal()">Hủy</button>
        <button class="btn btn-danger" id="modalConfirmBtn">Xác Nhận</button>
    `;
    
    container.style.display = 'block';
    
    document.getElementById('modalConfirmBtn').addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
}

// Close Modal
function closeModal() {
    document.getElementById('modalContainer').style.display = 'none';
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});
