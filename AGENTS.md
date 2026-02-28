# AGENTS.md - Track (Asset Tracker PWA)

Guide for AI coding agents working on this mobile-first Progressive Web App for tracking personal asset purchases and their lifecycle.

---

## Project Overview

**Type:** Mobile-first Progressive Web App (vanilla JavaScript, HTML5, CSS3)  
**Language:** Chinese (Simplified) - UI text and comments  
**Storage:** Browser localStorage  
**No build system:** Direct file execution in browser  
**Design:** Mobile-optimized (max-width 428px, iPhone 14 Pro size)

**Core Functionality:**
- Track purchased assets with dates, prices, categories, and tags
- Calculate and display daily cost per item (price ÷ usage days)
- Manage item lifecycle: Active (服役中), Retired (已退役), Sold (已卖出)
- Bottom navigation with floating action button (FAB)
- Modal-based add/edit interactions
- Full-screen search overlay
- Settings page with CSV export/import
- Summary card with progress bars showing item status distribution

---

## Running the Application

### Development
**Option 1: Direct File Opening**
```bash
# Open in default browser (Windows)
start index.html

# Or simply double-click index.html
```

**Option 2: Local Server (Recommended)**
```bash
# Python 3
python -m http.server 8000

# Node.js (if installed)
npx http-server -p 8000

# Then open: http://localhost:8000
```

### Testing
**No formal test framework currently configured.**

To manually test:
1. Open `index.html` in browser (preferably in mobile view/device)
2. Open DevTools Console (F12) for errors
3. Set browser viewport to mobile (428px width or use device emulation)
4. Test bottom navigation: Home, Timeline, Archive, Settings
5. Test FAB button: Opens add modal
6. Test add/edit modal: Add item, edit item, delete item
7. Test search: Open search, type query, select result
8. Test category tabs: Switch between categories
9. Test filter pills: Filter by status (all/active/retired/sold)
10. Test settings: Export CSV, import CSV
11. Verify localStorage persistence (refresh page)
12. Test touch interactions: Tap, scroll, swipe

### Linting/Formatting
**No linter/formatter currently configured.**

Consider adding:
```bash
# Future setup suggestions
npm init -y
npm install --save-dev eslint prettier
npx eslint app.js
npx prettier --write "*.{js,html,css}"
```

---

## Code Style Guidelines

### JavaScript (app.js)

**General Conventions:**
- **Variables:** Use `let` for reassignable, `const` for constants
- **Indentation:** 4 spaces (not tabs)
- **Quotes:** Single quotes `'` for strings (except in HTML attributes)
- **Semicolons:** Always use semicolons at statement ends
- **Line Endings:** CRLF (Windows-style `\r\n`)

**Naming Conventions:**
- **Variables/Functions:** camelCase (`currentFilter`, `calculateUsageDays`)
- **Constants:** camelCase for module-level (`items`, `currentSort`)
- **Global functions:** camelCase, descriptive names (`handleAddItem`, `openEditModal`)
- **Boolean variables:** Descriptive names without `is`/`has` prefix

**Function Style:**
```javascript
// Use function declarations for top-level functions
function calculateUsageDays(purchaseDate) {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    // ... implementation
    return diffDays;
}

// Arrow functions for callbacks
items.filter(item => item.status === currentFilter);
```

**Comments:**
- Use Chinese (Simplified) for comments
- Add section comments for logical groupings: `// 数据存储`, `// 初始化事件监听器`
- Document function purpose with single-line comment above: `// 计算使用天数`
- No JSDoc - simple inline comments preferred

**DOM Manipulation:**
- Use `document.getElementById()` for element selection
- Use `document.querySelectorAll()` for multiple elements
- Prefer template literals for HTML string generation
- Use `.innerHTML` for rendering multiple items
- Use `.textContent` for simple text updates

**Event Handling:**
- Use `addEventListener` in `initEventListeners()` function
- Some events via inline `onclick` attributes (legacy pattern in this codebase)
- Event handler functions named `handle[Action]` (e.g., `handleAddItem`)

**Data Flow:**
```javascript
// Global state variables at top
let items = [];
let currentPage = 'home'; // 'home', 'timeline', 'archive', 'settings'
let currentCategory = 'all'; // 'all', '电子', etc.
let currentFilter = 'all'; // 'all', 'active', 'retired', 'sold'
let currentSort = 'purchaseDate-desc';
let isEditMode = false;
let editingItemId = null;

// Load from localStorage on init
function loadItems() { /* ... */ }

// Save to localStorage after mutations
function saveItems() { /* ... */ }

// Re-render UI after state changes
function renderSummaryCard() { /* ... */ }
function renderCategoryTabs() { /* ... */ }
function renderItemsGrid() { /* ... */ }
```

**Error Handling:**
- Use `confirm()` for destructive actions (delete)
- Show notifications via `showNotification(message)` helper
- No try-catch blocks currently (consider adding for JSON.parse)

### HTML (index.html)

**Structure:**
- Semantic HTML5 elements
- Chinese labels and placeholders
- Mobile-first design with fixed header and bottom nav
- Modal dialogs for add/edit operations
- Full-screen overlays for search and settings

**Naming:**
- IDs: camelCase (`modalItemName`, `fabAddBtn`, `searchInput`)
- Classes: kebab-case with descriptive names (`app-container`, `modal-content`, `item-card`)
- Data attributes: `data-page`, `data-category`, `data-filter`

**Forms:**
- Modal-based forms (not inline)
- Input types: `text`, `date`, `number`, `select`, `textarea`
- Number inputs: include `step="0.01"` and `min="0"` for prices
- Status-dependent fields: Show sold price only when status is "sold"

### CSS (styles.css)

**Architecture:**
- CSS variables for theming (`:root`)
- Global reset at top (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- Mobile-first responsive design (max-width 428px)
- Fixed positioning for header and bottom nav
- Flexbox and CSS Grid for layouts

**Naming:**
- Classes: kebab-case, BEM-like structure (`item-card`, `item-header`, `status-badge`)
- Modifier classes: `active`, `retired`, `sold`
- State classes: `active`, `show`

**Color Scheme:**
- Primary gradient: `linear-gradient(135deg, #b8e94c 0%, #d4ff00 100%)` (lime green)
- Status colors:
  - Active: `#7ed321` (green)
  - Retired: `#ff9800` (orange)
  - Sold: `#999999` (gray)
- Text colors: `#333333`, `#666666`, `#999999`
- Backgrounds: `#f5f5f5` (page), `#ffffff` (cards)

**Spacing:**
- Consistent padding: `12px`, `16px`, `20px`
- Border radius: `12px` (cards), `16px` (summary), `20px` (modals)
- Gaps: `8px`, `12px` in grids

**Transitions:**
- Use `transition: all 0.2s` for quick interactions
- Animations defined via `@keyframes` (fadeIn, slideUp)

---

## Project Structure

```
countdown/
├── index.html          # Mobile-first HTML structure
├── app.js              # All application logic
├── styles.css          # Mobile-optimized styling
├── manifest.json       # PWA manifest
├── indx.jpg            # Design reference - home screen
├── addnew.jpg          # Design reference - add/edit modal
├── search.jpg          # Design reference - search overlay
└── AGENTS.md           # This file
```

**Single-file architecture:**
- All JS in one file (no modules)
- All CSS in one file (no preprocessor)
- PWA manifest for installability

---

## Key Functions Reference

| Function | Purpose |
|----------|---------|
| `initEventListeners()` | Set up all event handlers on page load |
| `switchPage(page)` | Handle bottom nav navigation |
| `renderSummaryCard()` | Update summary statistics at top |
| `renderCategoryTabs()` | Render dynamic category filter tabs |
| `renderItemsGrid()` | Render 2-column item grid with daily costs |
| `handleCategoryChange(cat)` | Filter items by category |
| `handleFilterChange(filter)` | Filter items by status |
| `openAddModal()` | Show modal for adding new item |
| `openEditModal(id)` | Show modal for editing existing item |
| `showModal()` | Display modal with animation |
| `closeModal()` | Hide modal and reset form |
| `handleSaveItem(e)` | Process form submission (add or edit) |
| `handleDeleteItem()` | Delete item from edit modal |
| `openSearchModal()` | Show full-screen search overlay |
| `closeSearchModal()` | Hide search overlay |
| `handleSearch(e)` | Filter items by search query |
| `renderSearchResults(results)` | Display search results in grid |
| `openSettingsPage()` | Show settings page |
| `closeSettingsPage()` | Hide settings page |
| `calculateUsageDays(date)` | Calculate days since purchase |
| `filterItems(items)` | Apply category and status filters |
| `sortItems(items)` | Apply sort order |
| `saveItems()` | Persist to localStorage |
| `loadItems()` | Load from localStorage |
| `calculateStatistics()` | Compute summary statistics |
| `exportToCSV()` | Export items to CSV file |
| `importFromCSV(file)` | Import items from CSV file |
| `parseCSV(content)` | Parse CSV string handling quotes/commas |
| `showNotification(msg)` | Display toast notification |

---

## Common Tasks

### Adding a New Field
1. Update `handleSaveItem()` to include new field in itemData
2. Add form input in modal body (`#addModal .modal-body`)
3. Update item card template in `renderItemsGrid()`
4. Update `populateModalForm()` to populate new field
5. Update `resetModalForm()` to clear new field

### Adding a New Category
1. Categories are automatically generated from existing items
2. Add default category label in `renderCategoryTabs()` categoryLabels map
3. Categories appear as tabs when items with that category exist

### Adding a New Status Filter
1. Add button in `.filter-pills` with `data-filter="value"`
2. Update `filterItems()` logic to handle new filter
3. Add progress bar in summary card if needed

### Modifying CSV Format
1. Update headers array in `exportToCSV()`
2. Update row mapping to match new column order
3. Update `importFromCSV()` parsing to match new structure
4. Update `statusMap` if status values change

### Customizing the Modal
1. Modal structure in `index.html` starting at `<div class="modal" id="addModal">`
2. Form inputs in `.modal-body`
3. Modal styling in `styles.css` under `/* Modal */`
4. Modal behavior in `app.js` functions: `showModal()`, `closeModal()`, `resetModalForm()`, `populateModalForm()`

---

## Features

### Mobile-First Design
**Layout:** Max-width 428px (iPhone 14 Pro size), centered on larger screens  
**Navigation:**
- Fixed header at top with app title "Track" and action buttons
- Fixed bottom navigation with 5 buttons:
  - 🏠 Home (default)
  - ⏰ Timeline (placeholder)
  - + Add (FAB - Floating Action Button in center)
  - 📂 Archive (placeholder)
  - ⚙️ Settings
- Content area scrolls between fixed header and bottom nav

### Summary Card
**Location:** Top of home screen  
**Displays:**
- Total Assets: Sum of all item prices
- Daily Cost: Average daily cost of active items
- Progress bars showing item distribution:
  - Active items (green)
  - Retired items (orange)
  - Sold items (gray)

### Category Filtering
**Location:** Horizontal scrollable tabs below summary card  
**Behavior:**
- "全部" shows all items
- Dynamic tabs generated from existing item categories
- Tap to filter items by category
- Works in combination with status filters

### Item Grid
**Layout:** 2-column grid of item cards  
**Card Contents:**
- Item name (2 lines max, ellipsis)
- Status badge (服役中/已退役/已卖出)
- Purchase price (¥X.XX)
- Daily cost (¥X.XX/天) in green
- Usage duration in days
- Category tag

**Interaction:** Tap card to open edit modal

### Add/Edit Modal
**Trigger:** FAB button (add) or tap item card (edit)  
**Structure:** Bottom sheet modal with:
- Close button (top right)
- Item icon display (center, editable)
- Item name input (large, centered)
- Form fields in grouped list:
  - 💰 Price
  - 📅 Purchase date
  - 🏷️ Category
  - 🏷️ Tags
  - 🔄 Status (dropdown)
  - 💵 Sold price (conditional, shows when status is "sold")
  - 📝 Notes (textarea)
- Footer buttons:
  - Delete (red, left, only in edit mode)
  - Save (lime green, right)

### Search
**Trigger:** 🔍 button in header  
**Structure:** Full-screen overlay with:
- Search bar at top
- Cancel button
- Results in 2-column grid (same as home screen)

**Search Fields:** Name, category, tags, notes  
**Interaction:** Tap result to close search and open edit modal

### Settings Page
**Trigger:** ⚙️ button in bottom nav  
**Structure:** Full-screen page with:
- Back button and "设置" title
- Data Management section:
  - 📥 Export Data (exports CSV)
  - 📤 Import Data (imports CSV)

### CSV Export/Import
**Format:** UTF-8 CSV with BOM for Excel compatibility  
**Columns:** 物品名称, 购买日期, 购买价格, 分类, 标签, 状态, 卖出价格, 备注

**Export:**
- Click "📥 导出CSV" button in controls section
- Downloads file named `物品追踪_YYYY-MM-DD.csv`
- Properly escapes commas, quotes, and newlines in data

**Import:**
- Click "📤 导入CSV" button to select file
- Merges imported items with existing data (does not replace)
- Validates required fields and shows error count
- Maps Chinese status names to internal values

---

## Notes for Agents

- **Preserve Chinese language** in UI text and comments
- **No dependencies:** Don't add npm packages without explicit approval
- **localStorage only:** No backend/database (data stored client-side)
- **Browser compatibility:** Targets modern mobile browsers (ES6+)
- **Mobile-first:** Always test in mobile viewport (428px width)
- **Touch interactions:** Use `:active` pseudo-class for tap feedback
- **Fixed positioning:** Header and bottom nav use `position: fixed`
- **PWA ready:** Has manifest.json for installation on mobile devices
- **Design references:** Check indx.jpg, addnew.jpg, search.jpg for UI specs
- **Modal animations:** Use CSS transitions for smooth slide-up effect
- **Global scope:** Functions are intentionally global for event handlers
- **Daily cost calculation:** price / usageDays (displayed as ¥X.XX/天)
- **Status colors:** Active=#7ed321, Retired=#ff9800, Sold=#999999
- **Lime green theme:** Primary color #b8e94c to #d4ff00 gradient
