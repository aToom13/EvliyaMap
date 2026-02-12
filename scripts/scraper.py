import requests
from bs4 import BeautifulSoup
import json
import re
import os
import time
from urllib.parse import unquote

# Base URL for Wikipedia
WIKI_BASE_URL = "https://tr.wikipedia.org"
LIST_URL = "https://tr.wikipedia.org/wiki/Evliya_Çelebi_Seyahatnamesi'ndeki_isimler_listesi"

# Output directory
OUTPUT_DIR = "../public"

# Volume Mapping (Based on Seyahatname Sections)
VOLUME_KEYWORDS = {
    1: ["istanbul", "üsküdar", "galata", "eyüp", "kağıthane", "beşiktaş", "beyoğlu", "sarıyer", "beykoz", "kadıköy", "adalar", "bakırköy", "zeytinburnu", "fatih", "eminönü", "rumeli hisarı", "yedikule", "topkapı", "ayasofya", "süleymaniye", "sultanahmet", "çemberlitaş", "dikilitaş", "kız kulesi", "bozdoğan", "kapalıçarşı"],
    2: ["bursa", "mudanya", "iznik", "trabzon", "batum", "gürcistan", "azerbaycan", "erzurum", "amasya", "artvin", "rize", "samsun", "sinop", "bolu", "düzce", "sakarya", "zonguldak", "bartın", "kastamonu", "karabük", "çorum", "giresun", "gümüşhane", "bayburt", "kars", "ardahan", "ığdır", "erzincan", "kafkasya", "boz kurt"],
    3: ["şam", "suriye", "filistin", "konya", "kayseri", "sivas", "el-cezire", "ermenistan", "bulgaristan", "dobruca", "silistre", "niğbolu", "rusçuk", "sofya", "edirne", "kırklareli", "tekirdağ", "eskişehir", "aksaray", "nevşehir", "kırşehir", "yozgat", "tokat"],
    4: ["van", "bağdat", "tebriz", "basra", "mardin", "diyarbakır", "şaṭṭü'l-arab", "bitlis", "hakkari", "siirt", "batman", "şırnak", "musul", "kerkük", "erbil", "süleymaniye", "iran", "ırak"],
    5: ["oçakov", "rusya", "boğdan", "moldova", "transilvanya", "erdell", "bosna", "saraybosna", "dalmaçya", "özü", "kiev", "polonya", "lehistan", "çanakkale", "gelibolu", "balıkesir", "bilecek", "kütahya"],
    6: ["macaristan", "budin", "peşte", "uyvar", "kanije", "zigetvar", "avusturya", "viyana", "almanya", "felemenk", "hollanda", "belgrad", "sırbistan", "hersek", "karadağ", "arnavutluk", "isviçre", "isveç", "danimarka"],
    7: ["kırım", "bahçesaray", "dağıstan", "deşt-i kıpçak", "astrahan", "esterhan", "volga", "idil", "kazan", "sibirya", "avusturya seferi", "viyana"],
    8: ["arkipel", "yunanistan", "selanik", "atina", "girit", "kandiye", "hania", "mora", "peloponez", "yanya", "ohri", "manastır", "kavala", "dimetoka", "gümülcine"],
    9: ["izmir", "aydın", "muğla", "denizli", "kütahya", "afyon", "manisa", "uşak", "ısparta", "burdur", "antalya", "alanya", "adana", "mersin", "tarsus", "silifke", "antep", "gaziantep", "kilis", "urfa", "şanlıurfa", "halep", "rakka", "lübnan", "beyrut", "sayda", "kudüs", "mekke", "medine", "hac"],
    10: ["mısır", "kahire", "iskenderiye", "nil", "sudan", "habeşistan", "cibuti", "somali", "kızıldeniz"]
}

DEFAULT_VOLUME = 1

def get_page_content(url):
    try:
        response = requests.get(url, headers={'User-Agent': 'EvliyaMapScraper/1.0'})
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_names_from_list():
    html = get_page_content(LIST_URL)
    if not html:
        return []

    soup = BeautifulSoup(html, 'html.parser')
    names = []
    
    # Try finding the header by ID (could be on h2 or span)
    start_node = soup.find(id='Coğrafya')
    # If not found, look for text
    if not start_node:
        for header in soup.find_all(['h2', 'h3']):
            if 'Coğrafya' in header.get_text():
                start_node = header
                break
    
    if not start_node:
        print("Could not find 'Coğrafya' start node.")
        return []

    if start_node.name == 'span':
        current_element = start_node.parent
    else:
        current_element = start_node
    
    # Iterate through EVERYTHING after Coğrafya
    iterator = current_element.find_all_next()
    current_category = "Genel"
    
    print(f"Starting traversal from {current_element.name} -> {current_element.get_text(strip=True)}")

    for tag in iterator:
        if tag.name == 'h2':
            header_text = tag.get_text(strip=True)
            print(f"Encountered H2: {header_text}")
            current_category = header_text # Update category even if it's H2
            # We do NOT break here anymore, we scan everything.
        
        if tag.name in ['h3', 'h4']:
            current_category = tag.get_text(strip=True)
            print(f"Found Category: {current_category}")
            
        if tag.name in ['ul', 'ol']:
            items = tag.find_all('li', recursive=False)
            if not items:
                continue
                
            valid_list = True
            if 'tocsection' in str(tag) or 'reference' in str(tag):
                 valid_list = False
            
            if valid_list:
                # print(f"  Processing list with {len(items)} items under {current_category}")
                for li in items:
                    link = li.find('a')
                    text = li.get_text(strip=True)
                    
                    if not text or "^" in text: 
                        continue

                    url = None
                    title = text
                    if link and 'href' in link.attrs:
                        href = link['href']
                        if not href.startswith('/w/index.php') and not 'redlink=1' in href and not href.startswith('#'):
                            if href.startswith('//'):
                                url = "https:" + href
                            elif href.startswith('/'):
                                url = WIKI_BASE_URL + href
                            else:
                                url = href
                            title = link.get_text(strip=True)
                    
                    names.append({
                        'title': title,
                        'url': url,
                        'category': current_category,
                        'full_text': text
                    })
    
    return names

def determine_volume(name_info):
    text_lower = name_info['title'].lower() + " " + name_info['full_text'].lower()
    for vol, keywords in VOLUME_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return vol
    return DEFAULT_VOLUME

def get_coordinates_and_image(url):
    if not url:
        return None, None, None

    # Simple cache to avoid re-fetching same URL if list has dupes or retries
    # (Not implemented here but could be useful)
    
    html = get_page_content(url)
    if not html:
        return None, None, None
        
    soup = BeautifulSoup(html, 'html.parser')
    
    # Coordinates
    lat, lng = None, None
    geo_span = soup.find('span', class_='geo')
    if geo_span:
        coords = geo_span.get_text(strip=True).split(';')
        if len(coords) == 2:
            try:
                lat = float(coords[0])
                lng = float(coords[1])
            except:
                pass
    
    # Image
    image_url = None
    infobox = soup.find('table', class_='infobox')
    if infobox:
        img = infobox.find('img')
        if img:
            src = img.get('src')
            if src.startswith('//'):
                src = 'https:' + src
            if '/thumb/' in src:
                parts = src.split('/')
                filename = parts[-1]
                if 'px-' in filename:
                    new_filename = re.sub(r'^\d+px-', '800px-', filename)
                    parts[-1] = new_filename
                    image_url = "/".join(parts)
                else:
                    image_url = src
            else:
                image_url = src
    
    # Description
    description = ""
    content_div = soup.find('div', class_='mw-parser-output')
    if content_div:
        for p in content_div.find_all('p', recursive=False):
            text = p.get_text(strip=True)
            if len(text) > 20: 
                description = text[:200] + "..."
                break
                
    return (lat, lng), image_url, description

def map_type(category, title):
    cat_lower = category.lower()
    title_lower = title.lower()
    
    # EXCLUDE Persons and Terms
    if "kişi" in cat_lower or "sultan" in cat_lower or "paşa" in cat_lower:
        return "other"
    if "terim" in cat_lower or "term" in cat_lower:
        return "other"
    if "din" in cat_lower and not ("cami" in title_lower or "türbe" in title_lower or "kilise" in title_lower):
        return "other"
    
    if "kale" in title_lower or "hisar" in title_lower or "kaleler" in cat_lower:
        return "fortress"
    if "cami" in title_lower or "kilise" in title_lower or "türbe" in title_lower:
        return "landmark"
    if "dağ" in title_lower:
        return "nature"
    if "nehir" in title_lower or "akarsu" in title_lower or "göl" in title_lower or "deniz" in title_lower or "ada" in title_lower:
        return "nature"
    if "ülke" in title_lower or "bölge" in title_lower or "eyalet" in title_lower:
        return "region"
    if "şehir" in cat_lower or "kasaba" in cat_lower or "köy" in cat_lower:
        return "city"
        
    # If category matches explicit types
    if "ada" in cat_lower: return "nature"
    
    # If ambiguous but in a place category, default to city
    if "coğrafya" in cat_lower or "şehir" in cat_lower:
        return "city"
        
    return "other" # Default to other if we aren't sure it's a place

def main():
    print("Fetching list of names...")
    names = extract_names_from_list()
    print(f"Found {len(names)} total items.")
    
    data_by_volume = {i: [] for i in range(1, 11)}
    counters = {i: 1 for i in range(1, 11)}
    
    print("Processing items...")
    count = 0
    skipped_count = 0
    
    processed_titles = set()

    for i, item in enumerate(names):
        if item['title'] in processed_titles:
            continue
        
        type_str = map_type(item['category'], item['title'])
        if type_str == "other":
            skipped_count += 1
            continue

        if not item['url']:
            continue
        
        # Determine volume
        vol = determine_volume(item)
        
        print(f"[{i+1}/{len(names)}] Processing: {item['title']} (Vol: {vol}, Type: {type_str})")
        
        coords, image, description = get_coordinates_and_image(item['url'])
        
        if not coords:
            print(f"  > No coords found, skipping.")
            continue
            
        current_id = vol * 1000 + counters[vol]
        counters[vol] += 1
        
        entry = {
            "id": current_id,
            "title": item['title'],
            "type": type_str,
            "coords": [coords[0], coords[1]],
            "iconType": type_str,
            "excerpt": item['category'],
            "description": description,
            "images": [image] if image else []
        }
        
        data_by_volume[vol].append(entry)
        processed_titles.add(item['title'])
        count += 1
        
        # Save incrementally every 50 items
        if count % 50 == 0:
            print(f"Saving progress at {count} items...")
            for v, entries in data_by_volume.items():
                if not entries: continue
                # We overwrite the file, but that's fine as data_by_volume accumulates
                filename = f"cilt{v}_wiki.json"
                filepath = os.path.join(OUTPUT_DIR, filename)
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(entries, f, ensure_ascii=False, indent=2)

        # Be faster
        time.sleep(0.05)
        
    print(f"Finished processing. Total valid entries: {count}. Skipped: {skipped_count}.")

    # Save files
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    for vol, entries in data_by_volume.items():
        if not entries:
            continue
            
        filename = f"cilt{vol}_wiki.json"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {len(entries)} entries to {filename}")

if __name__ == "__main__":
    main()
