# Wikipedia Seyahatname Data Extraction Guide

This guide explains how to extract place names from Evliya Celebi Seyahatname on Wikipedia and convert them into map data.

---

## Target JSON Format

Each location must be in the following format:

```json
{
  "id": 1001,
  "title": "Location Name",
  "type": "city",
  "coords": [41.0086, 28.9802],
  "iconType": "city",
  "excerpt": "Short description (max 50 characters)",
  "description": "What Evliya Celebi said about this place...",
  "detail": "Detailed information from Seyahatname...",
  "images": ["https://upload.wikimedia.org/..."],
  "video": "https://youtube.com/..."
}
```

### Field Descriptions

| Field      | Required | Description                                                                 |
| ---------- | ------- | -------------------------------------------------------------------------- |
| `id`       | Yes     | Unique number (volume*1000 + sequence: Volume1=1001-1999, Volume2=2001-2999...) |
| `title`    | Yes     | Turkish place name                                                         |
| `type`     | Yes     | Category (see below)                                                       |
| `coords`   | Yes     | `[latitude, longitude]` (decimal degrees)                                  |
| `iconType` | Yes     | Icon type (can be same as type)                                             |
| `excerpt`  | Yes     | Short description (max 50 characters)                                       |
| `description` | No   | Evliya's words or historical information                                    |
| `detail`   | No     | Detailed information from Seyahatname                                        |
| `images`   | No     | Wikipedia images (array)                                                    |
| `video`    | No     | YouTube video link                                                         |

### Type Categories

| Type       | Description                     | Examples                        |
| ---------- | ------------------------------ | ------------------------------ |
| `city`     | City, town, village             | Istanbul, Edirne, Uskudar     |
| `landmark` | Monument, mosque, tomb, church   | Hagia Sophia, Suleymaniye Mosque |
| `region`   | Region, province, country       | Rumeli, Anatolia, Egypt        |
| `nature`   | Mountain, river, lake, island   | Mount Agri, Nile River          |
| `fortress` | Castle, fortress, wall         | Rumeli Fortress, Edirne Castle  |
| `wonder`   | Amazing, enchanted place        | Galata Tower, Obelisk          |
| `anchor`   | Port, pier                     | Galata Port                    |

---

## Data Source

**Main Wikipedia Page:**
```
https://tr.wikipedia.org/wiki/Evliya_Çelebi_Seyahatnamesi'ndeki_isimler_listesi
```

This page lists thousands of place names in A-Z alphabetical order.

---

## Data Extraction Steps

### Step 1: Extract Name List

Extract all place names from the Wikipedia page. For each name:
- Save if there's a Wikipedia link
- Note which volume(s) it appears in

### Step 2: Find Coordinates

Find coordinates for each place. Try in order:

1. **From Wikipedia Page:**
   - Coordinates in the top right corner of the page
   - Example: `41°00′31″N 28°58′48″E`
   - Convert to decimal degrees: `[41.0086, 28.9802]`

2. **From Wikidata:**
   - `https://www.wikidata.org/wiki/Q12345`
   - P625 (coordinate location) property

3. **From OpenStreetMap Nominatim:**
   - `https://nominatim.openstreetmap.org/search?q=Ayasofya+Istanbul&format=json`

4. **If Not Found:**
   - Mark as `null`
   - To be fixed manually later

### Step 3: Find Image

Get the main image from the Wikipedia page:
- Image in the Infobox
- Convert thumbnail URL to full size
- `thumb/xxx/200px-...` -> `xxx/800px-...`

### Step 4: Create Description

- Summarize the first paragraph of Wikipedia in Turkish
- Especially note if it relates to Evliya Celebi
- Max 200 characters

---

## Output Format

Create separate JSON files for each volume:
- `cilt1_wiki.json`
- `cilt2_wiki.json`
- ...
- `cilt10_wiki.json`

If a place appears in multiple volumes, add it to the **first volume** it appears in.

---

## Output Files

Save completed files to this directory:
```
/home/atom13/Projeler/EvliyaMap/public/
```

To be merged with existing files (`cilt1.json` - `cilt10.json`).

---

## Validation Checklist

- [ ] Are all IDs unique?
- [ ] Are coordinates in valid range? (lat: -90/+90, lng: -180/+180)
- [ ] Are type values in the list?
- [ ] No JSON syntax errors?
- [ ] Are Turkish characters correct?
