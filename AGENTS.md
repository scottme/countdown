# AGENTS.md - Purchase Tracker (物品购买追踪)

Guide for AI coding agents working on this client-side web application for tracking personal purchases and their lifecycle.

---

## Project Overview

**Type:** Client-side web application (vanilla JavaScript, HTML5, CSS3)  
**Language:** Chinese (Simplified) - UI text and comments  
**Storage:** Browser localStorage  
**No build system:** Direct file execution in browser

**Core Functionality:**
- Track purchased items with dates, prices, categories, and tags
- Calculate and display usage duration (years/months/days)
- Manage item lifecycle: Active (服役中), Retired (已退役), Sold (已卖出)
- Calculate profit/loss for sold items
- Filter, sort, and view items in list or grid layouts

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
1. Open `index.html` in browser
2. Open DevTools Console (F12) for errors
3. Test CRUD operations: Add, Edit, Delete items
4. Test filtering: all, active, retired, sold
5. Test sorting: by date, price, usage days
6. Test view switching: list vs grid
7. Verify localStorage persistence (refresh page)

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
let currentFilter = 'all';

// Load from localStorage on init
function loadItems() { /* ... */ }

// Save to localStorage after mutations
function saveItems() { /* ... */ }

// Re-render UI after state changes
function renderItems() { /* ... */ }
```

**Error Handling:**
- Use `confirm()` for destructive actions (delete)
- Show notifications via `showNotification(message)` helper
- No try-catch blocks currently (consider adding for JSON.parse)

### HTML (index.html)

**Structure:**
- Semantic HTML5 elements
- Chinese labels and placeholders
- Form validation: `required` attributes on critical fields
- Accessibility: `<label for="">` associations, `title` attributes

**Naming:**
- IDs: camelCase (`itemName`, `addItemForm`, `soldPriceGroup`)
- Classes: kebab-case with descriptive names (`add-item-section`, `form-row`, `item-card`)

**Forms:**
- Use native `<form>` with submit events
- Input types: `text`, `date`, `number`, `select`, `textarea`
- Number inputs: include `step="0.01"` and `min="0"` for prices

### CSS (styles.css)

**Architecture:**
- Global reset at top (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- Mobile-first responsive design
- CSS Grid for layouts (`grid-template-columns`, `auto-fit`)

**Naming:**
- Classes: kebab-case, BEM-like structure (`item-card`, `item-header`, `item-status`)
- Modifier classes: `status-active`, `status-retired`, `status-sold`
- State classes: `active`, `show`

**Color Scheme:**
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (purple/blue)
- Success: `#28a745` (green)
- Danger: `#dc3545` (red)
- Neutral grays: `#f8f9fa`, `#e9ecef`, `#495057`

**Spacing:**
- Consistent padding: `10px`, `15px`, `20px`, `30px`
- Border radius: `8px` (inputs), `10px` (cards), `20px` (container)
- Gaps: `15px` in grids

**Transitions:**
- Use `transition: all 0.3s` for hover effects
- Animations defined via `@keyframes` (slideIn, slideOut)

---

## Project Structure

```
countdown/
├── index.html          # Main HTML structure
├── app.js              # All application logic
├── styles.css          # All styling
└── sqlExe/             # Separate Python project (not part of this app)
```

**Single-file architecture:**
- All JS in one file (no modules)
- All CSS in one file (no preprocessor)
- Consider splitting into modules if project grows beyond 500 lines

---

## Key Functions Reference

| Function | Location | Purpose |
|----------|----------|---------|
| `initEventListeners()` | app.js:15 | Set up all event handlers on page load |
| `handleAddItem(e)` | app.js:62 | Process new item form submission |
| `handleEditItem(e)` | app.js:350 | Process edit form submission |
| `deleteItem(id)` | app.js:90 | Remove item with confirmation |
| `calculateUsageDays(date)` | app.js:100 | Calculate days since purchase |
| `formatUsageDuration(days)` | app.js:108 | Format as "X年X月X天" |
| `filterItems(items)` | app.js:151 | Apply status filter |
| `sortItems(items)` | app.js:157 | Apply sort order |
| `renderItems()` | app.js:183 | Main render function - update DOM |
| `openEditModal(id)` | app.js:320 | Show edit modal with item data |
| `saveItems()` | app.js:280 | Persist to localStorage |
| `loadItems()` | app.js:287 | Load from localStorage |
| `calculateStatistics()` | app.js:294 | Compute all dashboard statistics |
| `renderStatistics()` | app.js:340 | Update statistics dashboard UI |
| `exportToCSV()` | app.js:395 | Export items to CSV file |
| `escapeCSV(str)` | app.js:435 | Escape special characters for CSV |
| `importFromCSV(file)` | app.js:445 | Import items from CSV file |
| `parseCSV(content)` | app.js:510 | Parse CSV string handling quotes/commas |
| `showNotification(msg)` | app.js:590 | Display toast notification |

---

## Common Tasks

### Adding a New Field
1. Update data structure in `handleAddItem()` and `handleEditItem()`
2. Add form input in both `#addItemForm` and `#editItemForm` sections
3. Update item card template in `renderItems()`
4. Update `openEditModal()` to populate new field

### Adding a New Filter
1. Add button in `.filter-section` with `data-filter="value"`
2. Update `filterItems()` logic to handle new filter
3. Optional: Add to item status select options

### Adding Statistics
1. Update `calculateStatistics()` to compute new metric
2. Add HTML element in `.stats-grid` with unique ID in index.html
3. Update `renderStatistics()` to display the metric

### Modifying CSV Format
1. Update headers array in `exportToCSV()`
2. Update row mapping to match new column order
3. Update `importFromCSV()` parsing to match new structure
4. Update `statusMap` if status values change

### Modifying Calculations
- Usage days: `calculateUsageDays()` at app.js:100
- Profit/loss: Inline calculation in `renderItems()` at app.js:236
- Statistics: `calculateStatistics()` at app.js:294

---

## Features

### Statistics Dashboard
**Location:** Between controls and items list  
**Displays:**
- Total spending across all items
- Item counts by status (active/retired/sold)
- Average usage duration
- Total profit/loss from sold items
- Most expensive item
- Category breakdown with spending per category

**Update Triggers:**
- Automatically updates when items are added, edited, or deleted
- Updates after CSV import

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
- **Browser compatibility:** Targets modern browsers (ES6+)
- **Duplicate function:** `formatUsageDuration()` defined twice (lines 109-124 and 127-142) - clean up if refactoring
- **Global scope:** Functions are intentionally global for inline event handlers
