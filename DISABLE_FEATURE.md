# Disable Feature Implementation - Cascade Logic

## How It Works

### 1. **Disable Category** → Disables ALL subcategories + products
```
Category (OFF)
  ├── Subcategory 1 (AUTO OFF)
  │    ├── Product A (AUTO OFF)
  │    └── Product B (AUTO OFF)
  └── Subcategory 2 (AUTO OFF)
       ├── Product C (AUTO OFF)
       └── Product D (AUTO OFF)
```

### 2. **Disable Subcategory** → Disables ALL products in that subcategory
```
Category (ON)
  ├── Subcategory 1 (OFF)
  │    ├── Product A (AUTO OFF)
  │    └── Product B (AUTO OFF)
  └── Subcategory 2 (ON)
       ├── Product C (ON) ✅
       └── Product D (ON) ✅
```

### 3. **Disable Product** → Only that product is disabled
```
Category (ON)
  └── Subcategory (ON)
       ├── Product A (OFF) ❌
       └── Product B (ON) ✅
```

## Implementation

### Category Disable (`/api/admin/categories`)
When `isActive: false`:
1. Sets all subcategories `isActive: false`
2. Updates all products with `category: categoryName` to `isActive: false`

### Subcategory Disable (`/api/admin/categories`)
When subcategory `isActive: false`:
1. Updates all products with `category + subcategory` match to `isActive: false`

### Product Disable (`/api/admin/products`)
When `isActive: false`:
1. Only that specific product is disabled

## Result
- **Cascade effect**: Parent disable automatically disables all children
- **Efficient**: Database updates happen automatically
- **Consistent**: No orphaned active products under disabled categories
