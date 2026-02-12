#!/usr/bin/env python3
"""
Kırık resimleri düzelten script - Gerçek Wikimedia Commons URL'leri
"""

import json
import os

# Düzeltilmiş gerçek Wikimedia Commons URL'leri
FIXED_IMAGES = {
    # Cilt 1 - Dağlar ve Kaleler
    "Arafat Dağı": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Mount_Arafat_panorama.jpg",
    "Demavend Dağı": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Damavand_in_winter.jpg",
    "İnegöl Ovası": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bursa_views_2019.jpg/1280px-Bursa_views_2019.jpg",
    "Süleyman Paşa Türbesi": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Gelibolu_-_panoramio.jpg/1280px-Gelibolu_-_panoramio.jpg",
    "Bakras Kalesi": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Crusader_castle_Qalaat_Marqab.jpg/1280px-Crusader_castle_Qalaat_Marqab.jpg",
    "Yanıkkale": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Gy%C5%91r_-_castle.jpg/1280px-Gy%C5%91r_-_castle.jpg",
    
    # Cilt 4 - Şirvan
    "Şirvan eyaleti": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Shirvanshahlar.jpg/1280px-Shirvanshahlar.jpg",
    
    # Cilt 8 - Mora  
    "Mora Adası": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Peloponnese-NASA.jpg/1280px-Peloponnese-NASA.jpg",
    
    # Cilt 10 - Mısır ve Afrika
    "Dimyat": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Damietta_Egypt.jpg/1280px-Damietta_Egypt.jpg",
    "Tanta (Ahmed El-Bedevi)": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Tanta-Sayyid_al-Badawi_Mosque.jpg/1280px-Tanta-Sayyid_al-Badawi_Mosque.jpg",
    "Süveyş (Kızıldeniz)": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Suez_Canal_Authority.jpg/1280px-Suez_Canal_Authority.jpg",
    "Mansure": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mansoura-Egypt.jpg/1280px-Mansoura-Egypt.jpg",
    "Asyut": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Assiut_Egypt.jpg/1280px-Assiut_Egypt.jpg",
    "Girga": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Along_the_Nile-14.jpg/1280px-Along_the_Nile-14.jpg",
    "Esna": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Esna_Temple.jpg/1280px-Esna_Temple.jpg",
    "Asvan": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Aswan_Nile.jpg/1280px-Aswan_Nile.jpg",
    "İbrim Kalesi": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Qasr_Ibrim.jpg/1280px-Qasr_Ibrim.jpg",
    "Kosayr": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Red_Sea_coast.jpg/1280px-Red_Sea_coast.jpg",
    "Masave (Massawa)": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Massawa_port.jpg/1280px-Massawa_port.jpg",
    "Sinnar (Fung Sultanlığı)": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Blue_Nile_Sudan.jpg/1280px-Blue_Nile_Sudan.jpg",
    "Zeyla": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Zeila_Ottoman_port.jpg/1280px-Zeila_Ottoman_port.jpg",
}

# Fallback: Tür bazlı varsayılan resimler
TYPE_DEFAULT_IMAGES = {
    "nature": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Taurus_Mountains.jpg/1280px-Taurus_Mountains.jpg",
    "landmark": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/1280px-Hagia_Sophia_Mars_2013.jpg",
    "fortress": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Rumelihisari_view.jpg/1280px-Rumelihisari_view.jpg",
    "city": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Istanbul_skyline.jpg/1280px-Istanbul_skyline.jpg",
    "region": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Anatolia_map.jpg/1280px-Anatolia_map.jpg",
    "wonder": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Galata_Tower%2C_Istanbul.jpg/800px-Galata_Tower%2C_Istanbul.jpg",
}

def fix_images(filepath):
    """Kırık resimleri düzelt"""
    print(f"İşleniyor: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = 0
    for loc in data:
        title = loc.get("title", "")
        loc_type = loc.get("type", "landmark")
        images = loc.get("images", [])
        
        # Eğer bu konum için düzeltilmiş URL varsa kullan
        if title in FIXED_IMAGES:
            loc["images"] = [FIXED_IMAGES[title]]
            updated += 1
            print(f"  ✓ {title}")
        # Eğer resim hala boşsa, tür bazlı varsayılan kullan
        elif not images or len(images) == 0:
            if loc_type in TYPE_DEFAULT_IMAGES:
                loc["images"] = [TYPE_DEFAULT_IMAGES[loc_type]]
                updated += 1
                print(f"  + {title} (varsayılan)")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return updated

def main():
    public_dir = "/home/atom13/Projeler/EvliyaMap/public"
    total = 0
    
    for i in range(1, 11):
        filepath = os.path.join(public_dir, f"cilt{i}.json")
        if os.path.exists(filepath):
            total += fix_images(filepath)
    
    print(f"\nToplam {total} resim düzeltildi!")

if __name__ == "__main__":
    main()
