import { useState, useEffect, useCallback } from 'react';

// Sabit yedek veriler (demo modu için)
const BACKUP_LOCATIONS = [
  {
    id: 1,
    title: "Kahire (Mısır)",
    type: "city",
    coords: [30.0444, 31.2357],
    iconType: "landmark",
    excerpt: "Şehirlerin Anası",
    description: "Mısır diyarı, Nil nehrinin bereketli sularıyla hayat bulur.",
    detail: "Kahire, Evliya Çelebi'nin 10. cildinde genişçe yer alır.",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Cairo_Citadel_2.jpg/800px-Cairo_Citadel_2.jpg"]
  },
  {
    id: 2,
    title: "İstanbul (Dersaadet)",
    type: "city",
    coords: [41.0082, 28.9784],
    iconType: "city",
    excerpt: "Dünyanın Gözbebeği",
    description: "İstanbul ki, yedi tepe üzerine kurulmuş, iki denizi birleştiren eşsiz bir beldedir.",
    detail: "Seyahatname'nin 1. cildi tamamen İstanbul'a ayrılmıştır.",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Hagia_Sophia_Mars_2013.jpg/800px-Hagia_Sophia_Mars_2013.jpg"]
  }
];

/**
 * Konum verilerini yüklemek için özel hook.
 * @param {number} selectedVolume - Seçili cilt (0 = tüm ciltler)
 */
export function useLocations(selectedVolume) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data = [];

      if (selectedVolume === 0) {
        // Tüm ciltleri çek
        console.log("Tüm ciltler taranıyor...");
        const promises = [];
        for (let i = 1; i <= 10; i++) {
          promises.push(
            fetch(`./cilt${i}.json`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
        }
        const results = await Promise.all(promises);
        data = results.flat();

        if (data.length === 0) {
          throw new Error("Hiçbir cilt verisi bulunamadı");
        }
      } else {
        // Tek cilt çek
        const fileName = `./cilt${selectedVolume}.json`;
        console.log(`${fileName} aranıyor...`);
        const response = await fetch(fileName);
        if (!response.ok) {
          throw new Error(`${fileName} bulunamadı`);
        }
        data = await response.json();
      }

      setLocations(data);
    } catch (err) {
      console.warn("Veri çekme hatası:", err);
      const errorMsg = selectedVolume === 0
        ? "Tüm ciltler yüklenirken sorun oluştu."
        : `Cilt ${selectedVolume} verisi bulunamadı.`;

      setError(`${errorMsg} Demo modundasınız.`);
      setLocations(BACKUP_LOCATIONS);
    } finally {
      setLoading(false);
    }
  }, [selectedVolume]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, loading, error, refetch: fetchLocations };
}

export default useLocations;
