import json
import os
import re
import time
import requests

PUBLIC_DIR = "../public"

# Conceptual entries to remove (not actual places)
CONCEPTUAL_TITLES = [
    "eyalet", "cami", "hisar", "kale", "kale kapısı", "türbe", "kilise",
    "nehir", "göl", "dağ", "deniz", "ada", "ova", "boğaz", "körfez"
]

def fix_spacing(text):
    """Fix missing spaces in descriptions (words stuck together)."""
    if not text:
        return text
    
    # Add space before capital letters that follow lowercase letters
    # e.g., "BozcaadaveyaTenedos" -> "Bozcaada veya Tenedos"
    text = re.sub(r'([a-zğüşıöçı])([A-ZĞÜŞİÖÇ])', r'\1 \2', text)
    
    # Add space before common Turkish words that are stuck
    common_words = ['veya', 'ile', 'için', 'olarak', 'gibi', 'kadar', 'daha', 'sonra', 'önce', 'olan', 'ise', 'bir', 'bu', 've', 'ya', 'de', 'da']
    for word in common_words:
        # Match word stuck to previous word (no space before)
        pattern = r'([a-zğüşıöçı])(' + word + r')([^a-zğüşıöçı]|$)'
        text = re.sub(pattern, r'\1 \2\3', text, flags=re.IGNORECASE)
    
    return text

def get_nominatim_coords(title):
    """Try to get coordinates from Nominatim API."""
    try:
        # Clean up title for search
        search_term = title.replace(" ", "+")
        url = f"https://nominatim.openstreetmap.org/search?q={search_term}&format=json&limit=1"
        
        response = requests.get(url, headers={'User-Agent': 'EvliyaMapCleaner/1.0'})
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                return [lat, lon]
    except Exception as e:
        print(f"  Nominatim error for {title}: {e}")
    
    return None

def is_conceptual(entry):
    """Check if entry is a conceptual term, not an actual place."""
    title_lower = entry['title'].lower().strip()
    
    # Direct match with conceptual titles
    if title_lower in CONCEPTUAL_TITLES:
        return True
    
    # Check if title is too generic (single common word)
    if len(title_lower.split()) == 1 and title_lower in CONCEPTUAL_TITLES:
        return True
    
    return False

def clean_wiki_file(filepath):
    """Clean a single wiki JSON file."""
    print(f"Cleaning {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned = []
    removed_count = 0
    fixed_coords_count = 0
    
    for entry in data:
        # 1. Remove conceptual entries
        if is_conceptual(entry):
            print(f"  Removing conceptual: {entry['title']}")
            removed_count += 1
            continue
        
        # 2. Fix null coordinates
        if entry['coords'] == [None, None] or entry['coords'][0] is None:
            print(f"  Fixing coords for: {entry['title']}")
            new_coords = get_nominatim_coords(entry['title'])
            if new_coords:
                entry['coords'] = new_coords
                fixed_coords_count += 1
                print(f"    Found: {new_coords}")
            else:
                # Skip entries without valid coords
                print(f"    Could not find coords, removing entry.")
                removed_count += 1
                continue
            time.sleep(1)  # Be polite to Nominatim
        
        # 3. Fix spacing in description
        if entry.get('description'):
            entry['description'] = fix_spacing(entry['description'])
        
        cleaned.append(entry)
    
    print(f"  Removed: {removed_count}, Fixed coords: {fixed_coords_count}, Remaining: {len(cleaned)}")
    return cleaned

def merge_files(original_path, wiki_path, output_path):
    """Merge original cilt file with wiki file."""
    # Load original
    original_data = []
    if os.path.exists(original_path):
        with open(original_path, 'r', encoding='utf-8') as f:
            original_data = json.load(f)
    
    # Load wiki (already cleaned)
    wiki_data = []
    if os.path.exists(wiki_path):
        wiki_data = clean_wiki_file(wiki_path)
    
    # Get existing titles to avoid duplicates
    existing_titles = {entry['title'].lower() for entry in original_data}
    
    # Add wiki entries that don't exist in original
    added = 0
    for entry in wiki_data:
        if entry['title'].lower() not in existing_titles:
            original_data.append(entry)
            added += 1
    
    print(f"  Merged: Added {added} new entries from wiki")
    
    # Re-assign IDs to ensure uniqueness
    for i, entry in enumerate(original_data):
        # Keep first two digits as volume, increment sequence
        vol = entry['id'] // 1000
        entry['id'] = vol * 1000 + (i + 1)
    
    # Save merged file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(original_data, f, ensure_ascii=False, indent=2)
    
    print(f"  Saved merged file: {output_path} ({len(original_data)} entries)")

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    for vol in range(1, 11):
        original_file = os.path.join(PUBLIC_DIR, f"cilt{vol}.json")
        wiki_file = os.path.join(PUBLIC_DIR, f"cilt{vol}_wiki.json")
        output_file = original_file  # Overwrite original with merged
        
        if os.path.exists(wiki_file):
            print(f"\n=== Processing Volume {vol} ===")
            merge_files(original_file, wiki_file, output_file)
            
            # Remove the wiki file after merge
            os.remove(wiki_file)
            print(f"  Removed: {wiki_file}")
        else:
            print(f"\n=== Volume {vol}: No wiki file to merge ===")

if __name__ == "__main__":
    main()
