// ==================== State Variables ====================
let items = [];
let currentPage = 'home'; // 'home', 'timeline', 'archive', 'settings'
let currentCategory = 'all'; // 'all', '电子', etc.
let currentFilter = 'all'; // 'all', 'active', 'retired', 'sold'
let currentSort = 'addTime-desc'; // Default sort by add time (newest first)
let currentView = 'grid'; // 'grid' or 'list'
let currentLanguage = 'en'; // 'en' or 'zh'
let isEditMode = false;
let editingItemId = null;

// Language translations
const translations = {
    en: {
        appName: 'Track',
        home: 'Home',
        timeline: 'Timeline',
        archive: 'Archive',
        settings: 'Settings',
        add: 'Add',
        search: 'Search',
        all: 'All',
        active: 'Active',
        retired: 'Retired',
        sold: 'Sold',
        sortAddTime: 'Add Time',
        sortPurchaseDate: 'Purchase Date',
        sortPrice: 'Price',
        sortDailyCost: 'Daily Cost',
        totalAssets: 'Total Assets',
        dailyCost: 'Daily Cost',
        days: 'days',
        perDay: '/day',
        used: 'Used',
        itemName: 'Item Name',
        price: 'Price',
        purchaseDate: 'Purchase Date',
        category: 'Category',
        tags: 'Tags',
        status: 'Status',
        soldPrice: 'Sold Price',
        notes: 'Notes',
        save: 'Save',
        delete: 'Delete',
        cancel: 'Cancel',
        deleteConfirm: 'Are you sure you want to delete this item?',
        addSuccess: 'Item added successfully!',
        editSuccess: 'Item updated successfully!',
        deleteSuccess: 'Item deleted',
        emptyState: 'No items yet',
        emptyHint: 'Tap the + button below to add your first item',
        dataManagement: 'Data Management',
        exportData: 'Export Data',
        importData: 'Import Data',
        language: 'Language',
        noData: 'No data to export',
        exportSuccess: 'CSV exported successfully!',
        importSuccess: 'Import successful!',
        importError: 'Import failed: Invalid file format',
        searchPlaceholder: 'Search...',
        noResults: 'No items found',
        enterItemName: 'Enter item name',
        enterPrice: 'Enter price',
        enterCategory: 'e.g., Electronics',
        enterTags: 'Separate tags with commas',
        enterNotes: 'Notes...',
        assetOverview: 'Asset Overview'
    },
    zh: {
        appName: 'Track',
        home: '首页',
        timeline: '时间线',
        archive: '归档',
        settings: '设置',
        add: '添加',
        search: '搜索',
        all: '全部',
        active: '服役中',
        retired: '已退役',
        sold: '已卖出',
        sortAddTime: '添加时间',
        sortPurchaseDate: '购入时间',
        sortPrice: '金额',
        sortDailyCost: '日均成本',
        totalAssets: '总资产',
        dailyCost: '日均成本',
        days: '天',
        perDay: '/天',
        used: '已使用',
        itemName: '物品名称',
        price: '价格',
        purchaseDate: '购买日期',
        category: '类别',
        tags: '标签',
        status: '状态',
        soldPrice: '卖出价',
        notes: '备注',
        save: '保存',
        delete: '删除物品',
        cancel: '取消',
        deleteConfirm: '确定要删除这个物品吗？',
        addSuccess: '物品添加成功！',
        editSuccess: '物品修改成功！',
        deleteSuccess: '物品已删除',
        emptyState: '还没有物品',
        emptyHint: '点击下方 + 号添加第一个物品',
        dataManagement: '数据管理',
        exportData: '导出数据',
        importData: '导入数据',
        language: '语言',
        noData: '没有数据可以导出',
        exportSuccess: 'CSV导出成功！',
        importSuccess: '导入成功！',
        importError: '导入失败：文件格式错误',
        searchPlaceholder: '搜索',
        noResults: '没有找到相关物品',
        enterItemName: '请输入物品名称',
        enterPrice: '请输入物品价格',
        enterCategory: '如：电子',
        enterTags: '多个标签用逗号分隔',
        enterNotes: '记录相关信息...',
        assetOverview: '资产总览'
    }
};

// Get translated text
function t(key) {
    return translations[currentLanguage][key] || key;
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadItems();
    initEventListeners();
    updateLanguage();
    renderSummaryCard();
    renderCategoryTabs();
    renderItemsGrid();
});

// ==================== Event Listeners ====================
function initEventListeners() {
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            if (page) {
                switchPage(page);
            }
        });
    });

    // FAB button - open add modal
    document.getElementById('fabAddBtn').addEventListener('click', () => {
        openAddModal();
    });

    // Header search button
    document.getElementById('searchBtn').addEventListener('click', () => {
        openSearchModal();
    });

    // Category tabs
    const categoryTabsContainer = document.getElementById('categoryTabs');
    categoryTabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            const category = e.target.dataset.category;
            handleCategoryChange(category);
        }
    });

    // Filter pills
    document.querySelectorAll('.pill-btn').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            handleFilterChange(filter);
        });
    });

    // Sort button - toggle dropdown
    document.getElementById('sortBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('sortDropdown');
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        // Populate dropdown if empty
        if (!isVisible && dropdown.children.length === 0) {
            renderSortDropdown();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('sortDropdown');
        const sortBtn = document.getElementById('sortBtn');
        if (!dropdown.contains(e.target) && e.target !== sortBtn) {
            dropdown.style.display = 'none';
        }
    });

    // View toggle button
    document.getElementById('viewToggleBtn').addEventListener('click', () => {
        currentView = currentView === 'grid' ? 'list' : 'grid';
        document.getElementById('viewIcon').textContent = currentView === 'grid' ? '▦' : '☰';
        renderItemsGrid();
    });

    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);

    // Modal form submit
    document.getElementById('saveItemBtn').addEventListener('click', (e) => {
        e.preventDefault();
        handleSaveItem(e);
    });

    // Modal delete button
    document.getElementById('deleteItemBtn').addEventListener('click', handleDeleteItem);

    // Status change in modal
    document.getElementById('modalStatus').addEventListener('change', (e) => {
        const soldPriceRow = document.getElementById('soldPriceRow');
        soldPriceRow.style.display = e.target.value === 'sold' ? 'block' : 'none';
    });

    // Date validation - cannot be in the future
    const dateInput = document.getElementById('modalDate');
    dateInput.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            showNotification(currentLanguage === 'en' ? 'Purchase date cannot be in the future' : '购买日期不能晚于今天');
            e.target.value = today.toISOString().split('T')[0];
        }
    });

    // Search functionality
    document.getElementById('cancelSearch').addEventListener('click', closeSearchModal);
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Settings page
    document.getElementById('backFromSettings').addEventListener('click', closeSettingsPage);
    document.getElementById('exportDataBtn').addEventListener('click', exportToCSV);
    document.getElementById('importDataInput').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importFromCSV(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });

    // Language toggle
    document.getElementById('languageToggle').addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        saveSettings();
        updateLanguage();
    });
}

// ==================== Page Navigation ====================
function switchPage(page) {
    currentPage = page;
    
    // Update nav active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // For now, all pages show the same home view
    // In future, you can implement timeline, archive views
    if (page === 'settings') {
        openSettingsPage();
    } else {
        // Handle other pages (home, timeline, archive)
        renderSummaryCard();
        renderItemsGrid();
    }
}

// ==================== Category Management ====================
function renderCategoryTabs() {
    const categories = ['all', ...new Set(items.map(item => item.category).filter(c => c))];
    const categoryTabsContainer = document.getElementById('categoryTabs');
    
    const categoryLabels = {
        'all': '全部',
        '电子': '电子',
        '家具': '家具',
        '服饰': '服饰',
        '运动': '运动',
        '书籍': '书籍'
    };
    
    categoryTabsContainer.innerHTML = categories.map(cat => {
        const label = categoryLabels[cat] || cat || '未分类';
        return `<button class="tab-btn ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">${label}</button>`;
    }).join('');
}

function handleCategoryChange(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    renderItemsGrid();
}

function handleFilterChange(filter) {
    currentFilter = filter;
    
    // Update active pill
    document.querySelectorAll('.pill-btn').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.filter === filter);
    });
    
    renderItemsGrid();
}

// ==================== Summary Card ====================
function renderSummaryCard() {
    const stats = calculateStatistics();
    
    // Total assets (total spending)
    document.getElementById('totalAssets').textContent = stats.totalSpending.toFixed(0);
    
    // Daily cost (average daily cost across all items)
    const totalDailyCost = items
        .filter(item => item.status === 'active')
        .reduce((sum, item) => {
            const usageDays = calculateUsageDays(item.purchaseDate);
            return sum + (usageDays > 0 ? item.price / usageDays : 0);
        }, 0);
    document.getElementById('dailyCost').textContent = totalDailyCost.toFixed(2);
    
    // Progress bars
    const totalItems = stats.totalItems || 1; // Avoid division by zero
    
    // Active items progress
    const activePercent = (stats.activeItems / totalItems) * 100;
    document.getElementById('activeProgress').style.width = activePercent + '%';
    document.getElementById('activeCount').textContent = stats.activeItems;
    document.getElementById('activeTotal').textContent = totalItems;
    
    // Retired items progress
    const retiredPercent = (stats.retiredItems / totalItems) * 100;
    document.getElementById('retiredProgress').style.width = retiredPercent + '%';
    document.getElementById('retiredCount').textContent = stats.retiredItems;
    document.getElementById('retiredTotal').textContent = totalItems;
    
    // Sold items progress
    const soldPercent = (stats.soldItems / totalItems) * 100;
    document.getElementById('soldProgress').style.width = soldPercent + '%';
    document.getElementById('soldCount').textContent = stats.soldItems;
    document.getElementById('soldTotal').textContent = totalItems;
}

function calculateStatistics() {
    const stats = {
        totalSpending: 0,
        totalItems: items.length,
        activeItems: 0,
        retiredItems: 0,
        soldItems: 0
    };
    
    items.forEach(item => {
        stats.totalSpending += item.price;
        
        if (item.status === 'active') stats.activeItems++;
        else if (item.status === 'retired') stats.retiredItems++;
        else if (item.status === 'sold') stats.soldItems++;
    });
    
    return stats;
}

// ==================== Items Grid Rendering ====================
function renderItemsGrid() {
    const filteredItems = filterItems(items);
    const sortedItems = sortItems(filteredItems);
    
    const itemsGrid = document.getElementById('itemsGrid');
    
    // Update grid class based on view mode
    itemsGrid.className = currentView === 'grid' ? 'items-grid' : 'items-list';
    
    if (sortedItems.length === 0) {
        itemsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">${t('noResults')}</div>
            </div>
        `;
        return;
    }
    
    if (currentView === 'list') {
        // List view - compact 2-row layout showing name + purchase date + daily cost
        itemsGrid.innerHTML = sortedItems.map(item => {
            const usageDays = calculateUsageDays(item.purchaseDate);
            const dailyCost = usageDays > 0 ? (item.price / usageDays) : 0;
            const statusText = {
                'active': t('active'),
                'retired': t('retired'),
                'sold': t('sold')
            };
            const purchaseDate = new Date(item.purchaseDate).toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            
            return `
                <div class="item-card-list" onclick="openEditModal(${item.id})">
                    <div class="item-list-row1">
                        <div class="item-list-name">${item.name}</div>
                        <div class="status-badge ${item.status}">${statusText[item.status]}</div>
                    </div>
                    <div class="item-list-row2">
                        <span class="item-list-date">${purchaseDate}</span>
                        <span class="item-list-separator">•</span>
                        <span class="item-list-daily-cost">¥${dailyCost.toFixed(2)}${t('perDay')}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Grid view - 2 column compact cards
        itemsGrid.innerHTML = sortedItems.map(item => {
            const usageDays = calculateUsageDays(item.purchaseDate);
            const dailyCost = usageDays > 0 ? (item.price / usageDays) : 0;
            const statusText = {
                'active': t('active'),
                'retired': t('retired'),
                'sold': t('sold')
            };
            
            return `
                <div class="item-card" onclick="openEditModal(${item.id})">
                    <div class="item-header">
                        <div class="item-name">${item.name}</div>
                        <div class="status-badge ${item.status}">${statusText[item.status]}</div>
                    </div>
                    <div class="item-price">¥${item.price.toFixed(2)}</div>
                    <div class="item-daily-cost">¥${dailyCost.toFixed(2)}${t('perDay')}</div>
                    <div class="item-meta">
                        ${t('used')} ${usageDays} ${t('days')}
                        ${item.category ? `<div class="item-category">${item.category}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ==================== Filter and Sort ====================
function filterItems(items) {
    let filtered = items;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(item => item.category === currentCategory);
    }
    
    // Filter by status
    if (currentFilter !== 'all') {
        filtered = filtered.filter(item => item.status === currentFilter);
    }
    
    return filtered;
}

function sortItems(items) {
    const [field, order] = currentSort.split('-');
    
    return [...items].sort((a, b) => {
        let valueA, valueB;
        
        if (field === 'addTime') {
            // Use item.id as add time (timestamp)
            valueA = a.id || 0;
            valueB = b.id || 0;
        } else if (field === 'usageDays') {
            valueA = calculateUsageDays(a.purchaseDate);
            valueB = calculateUsageDays(b.purchaseDate);
        } else if (field === 'purchaseDate') {
            valueA = new Date(a.purchaseDate);
            valueB = new Date(b.purchaseDate);
        } else if (field === 'price') {
            valueA = a.price;
            valueB = b.price;
        } else if (field === 'dailyCost') {
            const usageDaysA = calculateUsageDays(a.purchaseDate);
            const usageDaysB = calculateUsageDays(b.purchaseDate);
            valueA = usageDaysA > 0 ? a.price / usageDaysA : 0;
            valueB = usageDaysB > 0 ? b.price / usageDaysB : 0;
        }
        
        if (order === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
}

// ==================== Modal Management ====================
function openAddModal() {
    isEditMode = false;
    editingItemId = null;
    
    // No modal title element in the new HTML structure
    document.getElementById('deleteItemBtn').style.display = 'none';
    
    resetModalForm();
    showModal();
}

function openEditModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    isEditMode = true;
    editingItemId = id;
    
    // No modal title element in the new HTML structure
    document.getElementById('deleteItemBtn').style.display = 'block';
    
    populateModalForm(item);
    showModal();
}

function showModal() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // Set max date to today
    const dateInput = document.getElementById('modalDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
}

function closeModal() {
    const modal = document.getElementById('addModal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scroll
    
    setTimeout(() => {
        modal.style.display = 'none';
        resetModalForm();
    }, 300); // Wait for animation to finish
}

function resetModalForm() {
    document.getElementById('modalItemName').value = '';
    document.getElementById('modalPrice').value = '';
    document.getElementById('modalDate').value = '';
    document.getElementById('modalCategory').value = '';
    document.getElementById('modalTags').value = '';
    document.getElementById('modalStatus').value = 'active';
    document.getElementById('modalSoldPrice').value = '';
    document.getElementById('modalNotes').value = '';
    document.getElementById('soldPriceRow').style.display = 'none';
}

function populateModalForm(item) {
    document.getElementById('modalItemName').value = item.name;
    document.getElementById('modalPrice').value = item.price;
    document.getElementById('modalDate').value = item.purchaseDate;
    document.getElementById('modalCategory').value = item.category || '';
    document.getElementById('modalTags').value = item.tags.join(', ');
    document.getElementById('modalStatus').value = item.status;
    document.getElementById('modalSoldPrice').value = item.soldPrice || '';
    document.getElementById('modalNotes').value = item.notes || '';
    
    // Show/hide sold price
    const soldPriceRow = document.getElementById('soldPriceRow');
    soldPriceRow.style.display = item.status === 'sold' ? 'block' : 'none';
}

function handleSaveItem(e) {
    e.preventDefault();
    
    const itemData = {
        name: document.getElementById('modalItemName').value.trim(),
        purchaseDate: document.getElementById('modalDate').value,
        price: parseFloat(document.getElementById('modalPrice').value),
        category: document.getElementById('modalCategory').value.trim(),
        tags: document.getElementById('modalTags').value.split(',').map(t => t.trim()).filter(t => t),
        status: document.getElementById('modalStatus').value,
        soldPrice: document.getElementById('modalStatus').value === 'sold' ? parseFloat(document.getElementById('modalSoldPrice').value) || 0 : 0,
        notes: document.getElementById('modalNotes').value.trim()
    };
    
    // Validation
    if (!itemData.name) {
        showNotification(currentLanguage === 'en' ? 'Please enter item name' : '请输入物品名称');
        return;
    }
    
    if (!itemData.purchaseDate) {
        showNotification(currentLanguage === 'en' ? 'Please select purchase date' : '请选择购买日期');
        return;
    }
    
    // Check if date is in the future
    const selectedDate = new Date(itemData.purchaseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
        showNotification(currentLanguage === 'en' ? 'Purchase date cannot be in the future' : '购买日期不能晚于今天');
        return;
    }
    
    if (isNaN(itemData.price) || itemData.price <= 0) {
        showNotification(currentLanguage === 'en' ? 'Please enter valid price' : '请输入有效的价格');
        return;
    }
    
    if (isEditMode && editingItemId !== null) {
        // Update existing item
        const itemIndex = items.findIndex(i => i.id === editingItemId);
        if (itemIndex !== -1) {
            items[itemIndex] = {
                ...items[itemIndex],
                ...itemData
            };
            showNotification(t('editSuccess'));
        }
    } else {
        // Add new item
        const newItem = {
            id: Date.now(),
            ...itemData
        };
        items.push(newItem);
        showNotification(t('addSuccess'));
    }
    
    saveItems();
    renderSummaryCard();
    renderCategoryTabs();
    renderItemsGrid();
    closeModal();
}

function handleDeleteItem() {
    if (!isEditMode || editingItemId === null) return;
    
    if (confirm(t('deleteConfirm'))) {
        items = items.filter(item => item.id !== editingItemId);
        saveItems();
        renderSummaryCard();
        renderCategoryTabs();
        renderItemsGrid();
        closeModal();
        showNotification(t('deleteSuccess'));
    }
}

// ==================== Search Functionality ====================
function openSearchModal() {
    const searchModal = document.getElementById('searchModal');
    searchModal.style.display = 'flex';
    document.getElementById('searchInput').focus();
}

function closeSearchModal() {
    const searchModal = document.getElementById('searchModal');
    searchModal.style.display = 'none';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length === 0) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    // Search in items
    const results = items.filter(item => {
        return item.name.toLowerCase().includes(query) ||
               (item.category && item.category.toLowerCase().includes(query)) ||
               item.tags.some(tag => tag.toLowerCase().includes(query)) ||
               (item.notes && item.notes.toLowerCase().includes(query));
    });
    
    renderSearchResults(results);
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function renderSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">${t('noResults')}</div>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = `<div class="items-grid">${results.map(item => {
        const usageDays = calculateUsageDays(item.purchaseDate);
        const dailyCost = usageDays > 0 ? (item.price / usageDays) : 0;
        const statusText = {
            'active': t('active'),
            'retired': t('retired'),
            'sold': t('sold')
        };
        
        return `
            <div class="item-card" onclick="closeSearchModal(); openEditModal(${item.id});">
                <div class="item-header">
                    <div class="item-name">${item.name}</div>
                    <div class="status-badge ${item.status}">${statusText[item.status]}</div>
                </div>
                <div class="item-price">¥${item.price.toFixed(2)}</div>
                <div class="item-daily-cost">¥${dailyCost.toFixed(2)}${t('perDay')}</div>
                <div class="item-meta">
                    ${t('used')} ${usageDays} ${t('days')}
                    ${item.category ? `<div class="item-category">${item.category}</div>` : ''}
                </div>
            </div>
        `;
    }).join('')}</div>`;
}

// ==================== Settings Page ====================
function openSettingsPage() {
    document.getElementById('settingsPage').style.display = 'block';
}

function closeSettingsPage() {
    document.getElementById('settingsPage').style.display = 'none';
}

// ==================== Data Management ====================
function saveItems() {
    localStorage.setItem('purchaseTrackerItems', JSON.stringify(items));
}

function loadItems() {
    const saved = localStorage.getItem('purchaseTrackerItems');
    if (saved) {
        items = JSON.parse(saved);
    }
}

// ==================== Utility Functions ====================
function calculateUsageDays(purchaseDate) {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.abs(today - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function formatUsageDuration(days) {
    if (days < 30) {
        return `${days} 天`;
    }
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
    
    let result = [];
    if (years > 0) result.push(`${years} 年`);
    if (months > 0) result.push(`${months} 月`);
    if (remainingDays > 0) result.push(`${remainingDays} 天`);
    
    return result.join(' ');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== CSV Export/Import ====================
function exportToCSV() {
    if (items.length === 0) {
        showNotification(t('noData'));
        return;
    }
    
    const headers = currentLanguage === 'zh' 
        ? ['物品名称', '购买日期', '购买价格', '分类', '标签', '状态', '卖出价格', '备注']
        : ['Item Name', 'Purchase Date', 'Price', 'Category', 'Tags', 'Status', 'Sold Price', 'Notes'];
    
    const rows = items.map(item => {
        const statusMap = {
            'active': currentLanguage === 'zh' ? '服役中' : 'Active',
            'retired': currentLanguage === 'zh' ? '已退役' : 'Retired',
            'sold': currentLanguage === 'zh' ? '已卖出' : 'Sold'
        };
        
        return [
            escapeCSV(item.name),
            item.purchaseDate,
            item.price.toFixed(2),
            escapeCSV(item.category || ''),
            escapeCSV(item.tags.join(',')),
            statusMap[item.status],
            item.soldPrice.toFixed(2),
            escapeCSV(item.notes || '')
        ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `track_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(t('exportSuccess'));
}

function escapeCSV(str) {
    if (typeof str !== 'string') return '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function importFromCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvContent = e.target.result;
            const lines = parseCSV(csvContent);
            
            if (lines.length < 2) {
                showNotification('CSV文件格式不正确或为空');
                return;
            }
            
            const dataRows = lines.slice(1);
            const importedItems = [];
            let errorCount = 0;
            
            dataRows.forEach((row, index) => {
                if (row.length < 8) {
                    errorCount++;
                    return;
                }
                
                const statusMap = {
                    '服役中': 'active',
                    '已退役': 'retired',
                    '已卖出': 'sold'
                };
                
                try {
                    const item = {
                        id: Date.now() + index,
                        name: row[0].trim(),
                        purchaseDate: row[1].trim(),
                        price: parseFloat(row[2]) || 0,
                        category: row[3].trim(),
                        tags: row[4] ? row[4].split(',').map(t => t.trim()).filter(t => t) : [],
                        status: statusMap[row[5].trim()] || 'active',
                        soldPrice: parseFloat(row[6]) || 0,
                        notes: row[7].trim()
                    };
                    
                    if (item.name && item.purchaseDate && item.price >= 0) {
                        importedItems.push(item);
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    errorCount++;
                }
            });
            
            if (importedItems.length === 0) {
                showNotification('没有有效的数据可以导入');
                return;
            }
            
            items = [...items, ...importedItems];
            saveItems();
            renderSummaryCard();
            renderCategoryTabs();
            renderItemsGrid();
            
            showNotification(t('importSuccess'));
            
        } catch (error) {
            showNotification(t('importError'));
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

function parseCSV(csvContent) {
    const lines = [];
    let currentLine = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvContent.length; i++) {
        const char = csvContent[i];
        const nextChar = csvContent[i + 1];
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentLine.push(currentField);
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (currentField || currentLine.length > 0) {
                currentLine.push(currentField);
                if (currentLine.some(field => field.trim())) {
                    lines.push(currentLine);
                }
                currentLine = [];
                currentField = '';
            }
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
        } else {
            currentField += char;
        }
    }
    
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        if (currentLine.some(field => field.trim())) {
            lines.push(currentLine);
        }
    }
    
    return lines;
}

// ==================== Settings Management ====================
function loadSettings() {
    const settings = localStorage.getItem('trackSettings');
    if (settings) {
        try {
            const parsed = JSON.parse(settings);
            currentLanguage = parsed.language || 'en';
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }
}

function saveSettings() {
    const settings = {
        language: currentLanguage
    };
    localStorage.setItem('trackSettings', JSON.stringify(settings));
}

// ==================== Language Management ====================
function updateLanguage() {
    // Update static text elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });

    // Update placeholders
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = t('searchPlaceholder');
    }

    // Update modal form placeholders
    const itemNameInput = document.getElementById('modalItemName');
    if (itemNameInput) {
        itemNameInput.placeholder = t('enterItemName');
    }

    const priceInput = document.getElementById('modalPrice');
    if (priceInput) {
        priceInput.placeholder = t('enterPrice');
    }

    const categoryInput = document.getElementById('modalCategory');
    if (categoryInput) {
        categoryInput.placeholder = t('enterCategory');
    }

    const tagsInput = document.getElementById('modalTags');
    if (tagsInput) {
        tagsInput.placeholder = t('enterTags');
    }

    const notesInput = document.getElementById('modalNotes');
    if (notesInput) {
        notesInput.placeholder = t('enterNotes');
    }

    const soldPriceInput = document.getElementById('modalSoldPrice');
    if (soldPriceInput) {
        soldPriceInput.placeholder = t('enterPrice');
    }

    // Update modal status select options
    const modalStatus = document.getElementById('modalStatus');
    if (modalStatus) {
        const currentValue = modalStatus.value;
        modalStatus.innerHTML = `
            <option value="active">${t('active')}</option>
            <option value="retired">${t('retired')}</option>
            <option value="sold">${t('sold')}</option>
        `;
        modalStatus.value = currentValue;
    }

    // Update language toggle button text
    const currentLangDisplay = document.getElementById('currentLanguage');
    if (currentLangDisplay) {
        currentLangDisplay.textContent = currentLanguage === 'en' ? 'English' : '中文';
    }

    // Update sort button text
    updateSortButtonText();

    // Re-render dynamic content
    renderSummaryCard();
    renderCategoryTabs();
    renderItemsGrid();
}

function updateSortButtonText() {
    const sortBtn = document.getElementById('sortBtn');
    if (!sortBtn) return;

    const sortOptions = {
        'addTime-desc': t('sortAddTime') + ' ↓',
        'addTime-asc': t('sortAddTime') + ' ↑',
        'purchaseDate-desc': t('sortPurchaseDate') + ' ↓',
        'purchaseDate-asc': t('sortPurchaseDate') + ' ↑',
        'price-desc': t('sortPrice') + ' ↓',
        'price-asc': t('sortPrice') + ' ↑',
        'dailyCost-desc': t('sortDailyCost') + ' ↓',
        'dailyCost-asc': t('sortDailyCost') + ' ↑'
    };

    sortBtn.textContent = sortOptions[currentSort] || t('sortAddTime');
}

// ==================== Sort Dropdown ====================
function renderSortDropdown() {
    const dropdown = document.getElementById('sortDropdown');
    if (!dropdown) return;

    const sortOptions = [
        { value: 'addTime-desc', label: t('sortAddTime') + ' ↓' },
        { value: 'addTime-asc', label: t('sortAddTime') + ' ↑' },
        { value: 'purchaseDate-desc', label: t('sortPurchaseDate') + ' ↓' },
        { value: 'purchaseDate-asc', label: t('sortPurchaseDate') + ' ↑' },
        { value: 'price-desc', label: t('sortPrice') + ' ↓' },
        { value: 'price-asc', label: t('sortPrice') + ' ↑' },
        { value: 'dailyCost-desc', label: t('sortDailyCost') + ' ↓' },
        { value: 'dailyCost-asc', label: t('sortDailyCost') + ' ↑' }
    ];

    dropdown.innerHTML = sortOptions.map(option => `
        <div class="sort-option ${currentSort === option.value ? 'active' : ''}" data-sort="${option.value}">
            ${option.label}
            ${currentSort === option.value ? '<span class="icon">✓</span>' : ''}
        </div>
    `).join('');

    // Add click handlers to sort options
    dropdown.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const sortValue = e.currentTarget.dataset.sort;
            currentSort = sortValue;
            updateSortButtonText();
            renderItemsGrid();
            dropdown.style.display = 'none';
            
            // Update active state
            dropdown.querySelectorAll('.sort-option').forEach(opt => {
                opt.classList.remove('active');
                opt.querySelector('.icon')?.remove();
            });
            e.currentTarget.classList.add('active');
            e.currentTarget.innerHTML += '<span class="icon">✓</span>';
        });
    });
}
