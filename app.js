// 数据存储
let items = [];
let currentFilter = 'all';
let currentSort = 'purchaseDate-desc';
let currentView = 'list'; // 'list' or 'grid'

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    initEventListeners();
    renderItems();
    renderStatistics();
});

// 初始化事件监听器
function initEventListeners() {
    // 表单提交
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
    
    // 状态选择变化
    document.getElementById('status').addEventListener('change', (e) => {
        const soldPriceGroup = document.getElementById('soldPriceGroup');
        soldPriceGroup.style.display = e.target.value === 'sold' ? 'block' : 'none';
    });
    
    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderItems();
        });
    });
    
    // 排序选择
    document.getElementById('sortBy').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderItems();
    });
    
    // 视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            renderItems();
        });
    });
    
    // 编辑表单提交
    document.getElementById('editItemForm').addEventListener('submit', handleEditItem);
    
    // 编辑状态选择变化
    document.getElementById('editStatus').addEventListener('change', (e) => {
        const soldPriceGroup = document.getElementById('editSoldPriceGroup');
        soldPriceGroup.style.display = e.target.value === 'sold' ? 'block' : 'none';
    });
    
    // 导入文件选择
    document.getElementById('importFile').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            importFromCSV(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });
}

// 处理添加物品
function handleAddItem(e) {
    e.preventDefault();
    
    const item = {
        id: Date.now(),
        name: document.getElementById('itemName').value.trim(),
        purchaseDate: document.getElementById('purchaseDate').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value.trim(),
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
        status: document.getElementById('status').value,
        soldPrice: document.getElementById('status').value === 'sold' ? parseFloat(document.getElementById('soldPrice').value) || 0 : 0,
        notes: document.getElementById('notes').value.trim()
    };
    
    items.push(item);
    saveItems();
    renderItems();
    
    // 重置表单
    e.target.reset();
    document.getElementById('soldPriceGroup').style.display = 'none';
    
    // 显示成功提示
    showNotification('物品添加成功！');
}

// 删除物品
function deleteItem(id) {
    if (confirm('确定要删除这个物品吗？')) {
        items = items.filter(item => item.id !== id);
        saveItems();
        renderItems();
        showNotification('物品已删除');
    }
}

// 计算使用天数
function calculateUsageDays(purchaseDate) {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.abs(today - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// 格式化使用时长（xx年xx月xx天）
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

// 格式化使用时长（xx年xx月xx天）
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

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// 筛选物品
function filterItems(items) {
    if (currentFilter === 'all') return items;
    return items.filter(item => item.status === currentFilter);
}

// 排序物品
function sortItems(items) {
    const [field, order] = currentSort.split('-');
    
    return [...items].sort((a, b) => {
        let valueA, valueB;
        
        if (field === 'usageDays') {
            valueA = calculateUsageDays(a.purchaseDate);
            valueB = calculateUsageDays(b.purchaseDate);
        } else if (field === 'purchaseDate') {
            valueA = new Date(a.purchaseDate);
            valueB = new Date(b.purchaseDate);
        } else if (field === 'price') {
            valueA = a.price;
            valueB = b.price;
        }
        
        if (order === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
}

// 渲染物品列表
function renderItems() {
    const filteredItems = filterItems(items);
    const sortedItems = sortItems(filteredItems);
    
    const itemsList = document.getElementById('itemsList');
    const itemCount = document.getElementById('itemCount');
    
    itemCount.textContent = `(${sortedItems.length})`;
    
    // 应用视图模式
    itemsList.className = `items-list ${currentView === 'grid' ? 'grid-view' : ''}`;
    
    if (sortedItems.length === 0) {
        itemsList.innerHTML = '<div class="empty-message">暂无物品，快来添加第一个吧！</div>';
        return;
    }
    
    itemsList.innerHTML = sortedItems.map(item => {
        const usageDays = calculateUsageDays(item.purchaseDate);
        const usageDuration = formatUsageDuration(usageDays);
        const statusText = {
            'active': '服役中',
            'retired': '已退役',
            'sold': '已卖出'
        };
        
        return `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${item.name}</div>
                    <div class="item-status status-${item.status}">${statusText[item.status]}</div>
                </div>
                
                <div class="item-info">
                    <div class="info-item">
                        <div class="info-label">已使用时间</div>
                        <div class="info-value usage-days">${usageDuration}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">购买日期</div>
                        <div class="info-value">${formatDate(item.purchaseDate)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">购买价格</div>
                        <div class="info-value">¥${item.price.toFixed(2)}</div>
                    </div>
                    ${item.status === 'sold' ? `
                    <div class="info-item">
                        <div class="info-label">卖出价格</div>
                        <div class="info-value">¥${item.soldPrice.toFixed(2)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">盈亏</div>
                        <div class="info-value" style="color: ${item.soldPrice >= item.price ? '#28a745' : '#dc3545'}">
                            ${item.soldPrice >= item.price ? '+' : ''}¥${(item.soldPrice - item.price).toFixed(2)}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                ${item.category ? `
                <div class="item-info">
                    <div class="info-item">
                        <div class="info-label">分类</div>
                        <div class="info-value">${item.category}</div>
                    </div>
                </div>
                ` : ''}
                
                ${item.tags.length > 0 ? `
                <div class="item-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ` : ''}
                
                ${item.notes ? `
                <div class="item-notes">
                    <strong>备注：</strong>${item.notes}
                </div>
                ` : ''}
                
                <div class="item-actions">
                    <button class="btn-edit" onclick="openEditModal(${item.id})">编辑</button>
                    <button class="btn-delete" onclick="deleteItem(${item.id})">删除</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Update statistics after rendering items
    renderStatistics();
}

// 保存到 localStorage
function saveItems() {
    localStorage.setItem('purchaseTrackerItems', JSON.stringify(items));
}

// 从 localStorage 加载
function loadItems() {
    const saved = localStorage.getItem('purchaseTrackerItems');
    if (saved) {
        items = JSON.parse(saved);
    }
}

// 计算统计数据
function calculateStatistics() {
    const stats = {
        totalSpending: 0,
        totalItems: items.length,
        activeItems: 0,
        retiredItems: 0,
        soldItems: 0,
        avgUsage: 0,
        profitLoss: 0,
        mostExpensive: null,
        categoryBreakdown: {}
    };
    
    if (items.length === 0) return stats;
    
    let totalUsageDays = 0;
    
    items.forEach(item => {
        // Total spending
        stats.totalSpending += item.price;
        
        // Count by status
        if (item.status === 'active') stats.activeItems++;
        else if (item.status === 'retired') stats.retiredItems++;
        else if (item.status === 'sold') stats.soldItems++;
        
        // Profit/loss calculation
        if (item.status === 'sold') {
            stats.profitLoss += (item.soldPrice - item.price);
        }
        
        // Usage days
        totalUsageDays += calculateUsageDays(item.purchaseDate);
        
        // Most expensive
        if (!stats.mostExpensive || item.price > stats.mostExpensive.price) {
            stats.mostExpensive = item;
        }
        
        // Category breakdown
        const category = item.category || '未分类';
        if (!stats.categoryBreakdown[category]) {
            stats.categoryBreakdown[category] = 0;
        }
        stats.categoryBreakdown[category] += item.price;
    });
    
    // Average usage
    stats.avgUsage = Math.round(totalUsageDays / items.length);
    
    return stats;
}

// 渲染统计面板
function renderStatistics() {
    const stats = calculateStatistics();
    
    // Update basic stats
    document.getElementById('statTotalSpending').textContent = `¥${stats.totalSpending.toFixed(2)}`;
    document.getElementById('statTotalItems').textContent = stats.totalItems;
    document.getElementById('statActiveItems').textContent = stats.activeItems;
    document.getElementById('statRetiredItems').textContent = stats.retiredItems;
    document.getElementById('statSoldItems').textContent = stats.soldItems;
    document.getElementById('statAvgUsage').textContent = formatUsageDuration(stats.avgUsage);
    
    // Profit/loss with color
    const profitLossEl = document.getElementById('statProfitLoss');
    profitLossEl.textContent = `${stats.profitLoss >= 0 ? '+' : ''}¥${stats.profitLoss.toFixed(2)}`;
    profitLossEl.style.color = stats.profitLoss >= 0 ? '#28a745' : '#dc3545';
    
    // Most expensive item
    const mostExpensiveEl = document.getElementById('statMostExpensive');
    if (stats.mostExpensive) {
        mostExpensiveEl.textContent = `${stats.mostExpensive.name} (¥${stats.mostExpensive.price.toFixed(2)})`;
    } else {
        mostExpensiveEl.textContent = '-';
    }
    
    // Category breakdown
    const categoryBreakdownEl = document.getElementById('categoryBreakdown');
    const sortedCategories = Object.entries(stats.categoryBreakdown)
        .sort((a, b) => b[1] - a[1]);
    
    if (sortedCategories.length > 0) {
        categoryBreakdownEl.innerHTML = `
            <h3>分类支出</h3>
            <div class="category-list">
                ${sortedCategories.map(([category, spending]) => `
                    <div class="category-item">
                        <span class="category-name">${category}</span>
                        <span class="category-spending">¥${spending.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        categoryBreakdownEl.innerHTML = '';
    }
}

// 导出为CSV
function exportToCSV() {
    if (items.length === 0) {
        showNotification('没有数据可以导出');
        return;
    }
    
    // CSV header
    const headers = ['物品名称', '购买日期', '购买价格', '分类', '标签', '状态', '卖出价格', '备注'];
    
    // Convert items to CSV rows
    const rows = items.map(item => {
        const statusMap = {
            'active': '服役中',
            'retired': '已退役',
            'sold': '已卖出'
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
    
    // Combine header and rows
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `物品追踪_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('CSV导出成功！');
}

// 转义CSV特殊字符
function escapeCSV(str) {
    if (typeof str !== 'string') return '';
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// 从CSV导入
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
            
            // Skip header row
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
                        id: Date.now() + index, // Unique ID
                        name: row[0].trim(),
                        purchaseDate: row[1].trim(),
                        price: parseFloat(row[2]) || 0,
                        category: row[3].trim(),
                        tags: row[4] ? row[4].split(',').map(t => t.trim()).filter(t => t) : [],
                        status: statusMap[row[5].trim()] || 'active',
                        soldPrice: parseFloat(row[6]) || 0,
                        notes: row[7].trim()
                    };
                    
                    // Validate required fields
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
            
            // Merge with existing items
            items = [...items, ...importedItems];
            saveItems();
            renderItems();
            
            const message = errorCount > 0 
                ? `导入成功！已添加 ${importedItems.length} 个物品，${errorCount} 条记录有误`
                : `导入成功！已添加 ${importedItems.length} 个物品`;
            
            showNotification(message);
            
        } catch (error) {
            showNotification('导入失败：文件格式错误');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 解析CSV内容
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
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // Field separator
            currentLine.push(currentField);
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            // Line separator
            if (currentField || currentLine.length > 0) {
                currentLine.push(currentField);
                if (currentLine.some(field => field.trim())) {
                    lines.push(currentLine);
                }
                currentLine = [];
                currentField = '';
            }
            // Skip \r\n
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
        } else {
            currentField += char;
        }
    }
    
    // Add last field and line
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        if (currentLine.some(field => field.trim())) {
            lines.push(currentLine);
        }
    }
    
    return lines;
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 打开编辑模态框
function openEditModal(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    // 填充表单
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editPurchaseDate').value = item.purchaseDate;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editCategory').value = item.category || '';
    document.getElementById('editTags').value = item.tags.join(', ');
    document.getElementById('editStatus').value = item.status;
    document.getElementById('editSoldPrice').value = item.soldPrice || '';
    document.getElementById('editNotes').value = item.notes || '';
    
    // 显示/隐藏卖出价格
    const soldPriceGroup = document.getElementById('editSoldPriceGroup');
    soldPriceGroup.style.display = item.status === 'sold' ? 'block' : 'none';
    
    // 显示模态框
    document.getElementById('editModal').classList.add('show');
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

// 处理编辑物品
function handleEditItem(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editItemId').value);
    const itemIndex = items.findIndex(i => i.id === id);
    
    if (itemIndex === -1) return;
    
    items[itemIndex] = {
        id: id,
        name: document.getElementById('editItemName').value.trim(),
        purchaseDate: document.getElementById('editPurchaseDate').value,
        price: parseFloat(document.getElementById('editPrice').value),
        category: document.getElementById('editCategory').value.trim(),
        tags: document.getElementById('editTags').value.split(',').map(t => t.trim()).filter(t => t),
        status: document.getElementById('editStatus').value,
        soldPrice: document.getElementById('editStatus').value === 'sold' ? parseFloat(document.getElementById('editSoldPrice').value) || 0 : 0,
        notes: document.getElementById('editNotes').value.trim()
    };
    
    saveItems();
    renderItems();
    closeEditModal();
    
    showNotification('物品修改成功！');
}

// 从模态框删除物品
function deleteItemFromModal() {
    const id = parseInt(document.getElementById('editItemId').value);
    if (confirm('确定要删除这个物品吗？')) {
        items = items.filter(item => item.id !== id);
        saveItems();
        renderItems();
        closeEditModal();
        showNotification('物品已删除');
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
