# Final Report

## Operations Completed

### 1. Wikipedia Data Extraction
- **Source**: `https://tr.wikipedia.org/wiki/Evliya_Çelebi_Seyahatnamesi'ndeki_isimler_listesi`
- **Tool**: `scripts/scraper.py` - Python-based web scraping
- Geography, Cities, and province-based categories were scanned

### 2. Data Cleaning
- **Tool**: `scripts/clean_data.py`
- Conceptual terms deleted: `eyalet`, `cami`, `hisar`, `kale`, `turbe`, `kilise`
- Null coordinates fixed using Nominatim API
- Spacing errors in descriptions fixed with regex

### 3. Merging
- `cilt[N]_wiki.json` files were merged into existing `cilt[N].json` files
- Duplicate records were filtered

---

## Result Files

| File       | Size   | Record Count |
| ---------- | ------ | ------------ |
| `cilt1.json`  | 31 KB | 62           |
| `cilt2.json`  | 6 KB  | 12           |
| `cilt3.json`  | 7 KB  | 12           |
| `cilt4.json`  | 10 KB | 15           |
| `cilt5.json`  | 9 KB  | 13           |
| `cilt6.json`  | 10 KB | 15           |
| `cilt7.json`  | 11 KB | 16           |
| `cilt8.json`  | 12 KB | 17           |
| `cilt9.json`  | 9 KB  | 14           |
| `cilt10.json` | 11 KB | 22           |

---

## Example Data

```json
{
  "id": 1001,
  "title": "Bozcaada",
  "type": "nature",
  "coords": [39.8347344, 26.0701917],
  "iconType": "nature",
  "excerpt": "Islands",
  "description": "Bozcaada or formerly Tenedos, Turkey's third largest..."
}
```

---

## Issues Fixed

| Issue                          | Status                      |
| ------------------------------ | -------------------------- |
| Null coordinates (Bozcaada etc.) | Fixed (Nominatim)         |
| Conceptual records (eyalet, cami) | Deleted                   |
| Spacing errors in descriptions  | Fixed                      |
| Wiki files merging             | Completed                  |
