import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, X, Scroll, Landmark, Waves, Mountain, Compass,
  Anchor, Sun, Loader2, MapPin, Search, Video, Image as ImageIcon, Library, Globe
} from 'lucide-react';

// --- SABİT VERİLER (Demo ve Yedek için) ---
const BACKUP_LOCATIONS = [
  {
    "id": 1,
    "title": "Kahire (Mısır)",
    "type": "city",
    "coords": [30.0444, 31.2357],
    "iconType": "landmark",
    "excerpt": "Şehirlerin Anası",
    "description": "Mısır diyarı, Nil nehrinin bereketli sularıyla hayat bulur. Kahire Kalesi, sanki dağların tepesine kondurulmuş bir kartal yuvasıdır.",
    "detail": "Kahire, Evliya Çelebi'nin 10. cildinde genişçe yer alır. Nil Nehri'nin taşma zamanları anlatılır.",
    "images": ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Cairo_Citadel_2.jpg/800px-Cairo_Citadel_2.jpg"]
  },
  {
    "id": 2,
    "title": "İstanbul (Dersaadet)",
    "type": "city",
    "coords": [41.0082, 28.9784],
    "iconType": "city",
    "excerpt": "Dünyanın Gözbebeği",
    "description": "İstanbul ki, yedi tepe üzerine kurulmuş, iki denizi birleştiren eşsiz bir beldedir.",
    "detail": "Seyahatname'nin 1. cildi tamamen İstanbul'a ayrılmıştır.",
    "images": ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Hagia_Sophia_Mars_2013.jpg/800px-Hagia_Sophia_Mars_2013.jpg"]
  }
];

// --- İkon Eşleştirme ---
const ICON_MAP = {
  'landmark': <Landmark size={20} />,
  'compass': <Compass size={20} />,
  'mountain': <Mountain size={20} />,
  'waves': <Waves size={20} />,
  'anchor': <Anchor size={20} />,
  'book': <BookOpen size={20} />,
  'scroll': <Scroll size={20} />,
  'sun': <Sun size={20} />,
  'city': <MapPin size={20} />
};

export default function SeyahatnameApp() {
  const [locations, setLocations] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(1); // 0 = Tüm Ciltler, 1-10 = Özel Cilt
  const [mapReady, setMapReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobil için sidebar toggle
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Ekran boyutu değişimini dinle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Veri Çekme (Cilt seçimine göre dinamik)
  useEffect(() => {
    const fetchLocations = async () => {
      setDataLoading(true);
      setError(null);
      setActiveLocation(null);

      try {
        let data = [];

        if (selectedVolume === 0) {
          // TÜM CİLTLERİ ÇEKME MANTIĞI
          console.log("Tüm ciltler taranıyor...");
          const promises = [];
          for (let i = 1; i <= 10; i++) {
            promises.push(
              fetch(`./cilt${i}.json`)
                .then(res => {
                  if (!res.ok) return []; // Dosya yoksa boş dizi dön
                  return res.json();
                })
                .catch(() => []) // Hata olursa boş dizi dön
            );
          }

          const results = await Promise.all(promises);
          // Tüm dizileri tek bir dizide birleştir (flat)
          data = results.flat();

          if (data.length === 0) {
            throw new Error("Hiçbir cilt verisi bulunamadı");
          }

        } else {
          // TEK CİLT ÇEKME MANTIĞI
          const fileName = `./cilt${selectedVolume}.json`;
          console.log(`${fileName} aranıyor...`);
          const response = await fetch(fileName);
          if (!response.ok) {
            throw new Error(`${fileName} bulunamadı`);
          }
          data = await response.json();
        }

        setLocations(data);
        setDataLoading(false);

      } catch (err) {
        console.warn("Veri çekme hatası:", err);
        const errorMsg = selectedVolume === 0
          ? "Tüm ciltler yüklenirken sorun oluştu."
          : `Cilt ${selectedVolume} verisi bulunamadı.`;

        setError(`${errorMsg} Demo modundasınız.`);
        setLocations(BACKUP_LOCATIONS);
        setDataLoading(false);
      }
    };

    fetchLocations();
  }, [selectedVolume]);

  // 2. Leaflet Script Yükleme
  useEffect(() => {
    const scriptId = 'leaflet-script-seyahatname';
    if (document.getElementById(scriptId)) {
      if (window.L) setMapReady(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.id = scriptId;
    script.async = true;
    script.onload = () => setMapReady(true);
    document.body.appendChild(script);
  }, []);

  // 3. Harita Başlatma
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || locations.length === 0) return;

    const L = window.L;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [39.0, 35.0],
      zoom: 5,
      zoomControl: false,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;
    markersRef.current = {};

    const markers = [];
    locations.forEach(loc => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#8b4513;width:14px;height:14px;border-radius:50%;border:2px solid #fdf6e3;box-shadow:0 2px 5px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker(loc.coords, { icon: customIcon }).addTo(map);
      marker.on('click', () => handleLocationSelect(loc));
      markersRef.current[loc.id] = marker;
      markers.push(marker);
    });

    // Tüm noktaları gösterecek şekilde haritayı sığdır
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady, locations]); // locations değiştiğinde haritayı yeniden çiz

  const handleLocationSelect = (location) => {
    setActiveLocation(location);
    if (isMobile) {
      setSidebarOpen(false); // Mobilde sidebar'ı kapat
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.coords[0], location.coords[1] - 0.5], 8, { duration: 1.5 });
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#fdf6e3', fontFamily: "'Merriweather', serif", position: 'relative' },
    sidebar: {
      width: isMobile ? '100%' : '350px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: isMobile ? 'none' : '4px solid #e6d2b5',
      backgroundColor: '#fdf6e3',
      zIndex: 20,
      flexShrink: 0,
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      position: isMobile ? 'fixed' : 'relative',
      left: isMobile ? (sidebarOpen ? 0 : '-100%') : 'auto',
      top: 0,
      bottom: 0,
      transition: 'left 0.3s ease-in-out',
      maxWidth: isMobile ? '85vw' : '350px'
    },
    header: { padding: '1.5rem', backgroundColor: '#f4e4bc', borderBottom: '1px solid #d4c5a5', textAlign: 'center', position: 'relative' },
    headerTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#5c3a21', margin: 0, fontFamily: "'Cinzel', serif" },
    // Yeni stil: Cilt Seçim Alanı Konteyneri
    volumeContainer: { padding: '10px 15px', borderBottom: '1px solid #e6d2b5', backgroundColor: '#fffdf5' },
    volumeGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '5px', marginTop: '5px' },
    volumeBtn: (isActive) => ({
      padding: '5px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer',
      backgroundColor: isActive ? '#8b4513' : '#fdf6e3',
      color: isActive ? '#fff' : '#5c3a21',
      border: `1px solid ${isActive ? '#5c3a21' : '#d4c5a5'}`,
      borderRadius: '4px', transition: 'all 0.2s',
      textAlign: 'center'
    }),
    allVolumesBtn: (isActive) => ({
      width: '100%', padding: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer',
      backgroundColor: isActive ? '#5c3a21' : '#fdf6e3', // Aktifse daha koyu kahve
      color: isActive ? '#fff' : '#5c3a21',
      border: `1px solid ${isActive ? '#5c3a21' : '#d4c5a5'}`,
      borderRadius: '4px', transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      fontFamily: "'Cinzel', serif"
    }),
    searchBox: { padding: '10px 15px', backgroundColor: '#fdf6e3' },
    input: { width: '100%', padding: '8px 8px 8px 32px', borderRadius: '4px', border: '1px solid #d4c5a5', backgroundColor: '#fffdf5', fontFamily: 'inherit', color: '#5c3a21' },
    list: { flex: 1, overflowY: 'auto', padding: '15px' },
    card: (isActive) => ({
      padding: '12px', marginBottom: '10px', borderRadius: '6px', cursor: 'pointer',
      border: isActive ? '2px solid #8b4513' : '1px solid #e6d2b5',
      backgroundColor: isActive ? '#ffffff' : '#fffdf5',
      boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s'
    }),
    detailPanel: {
      position: 'absolute',
      top: isMobile ? 'auto' : '20px',
      right: isMobile ? 0 : '20px',
      bottom: isMobile ? 0 : '20px',
      left: isMobile ? 0 : 'auto',
      width: isMobile ? '100%' : '400px',
      height: isMobile ? '60vh' : 'auto',
      backgroundColor: 'white',
      border: '1px solid #d4c5a5',
      borderRadius: isMobile ? '16px 16px 0 0' : '8px',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      transform: activeLocation ? (isMobile ? 'translateY(0)' : 'translateX(0)') : (isMobile ? 'translateY(100%)' : 'translateX(120%)'),
      transition: 'transform 0.4s ease-in-out',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    mobileMenuBtn: {
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 25,
      padding: '12px',
      backgroundColor: '#8b4513',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 15,
      display: (isMobile && sidebarOpen) ? 'block' : 'none'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');
        .leaflet-layer { filter: sepia(20%) contrast(95%) brightness(105%); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1e3c4; }
        ::-webkit-scrollbar-thumb { background: #8b4513; border-radius: 4px; }
        @media (max-width: 768px) {
          body { overflow: hidden; }
        }
      `}</style>

      {/* Mobil Menü Butonu */}
      <button
        style={styles.mobileMenuBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <BookOpen size={24} />
      </button>

      {/* Overlay (Mobilde sidebar açıkken arka planı karartır) */}
      <div
        style={styles.overlay}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SOL PANEL */}
      <aside style={styles.sidebar}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
            <Scroll color="#8b4513" size={28} />
            <h1 style={styles.headerTitle}>Seyahatname</h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#8b4513', fontStyle: 'italic', margin: 0 }}>"Seyahat Ya Resulallah"</p>
        </div>

        {/* Cilt Seçimi Alanı */}
        <div style={styles.volumeContainer}>
          {/* Tüm Ciltler Butonu */}
          <button
            onClick={() => setSelectedVolume(0)}
            style={styles.allVolumesBtn(selectedVolume === 0)}
          >
            <Globe size={16} />
            Tüm Ciltleri Göster
          </button>

          {/* 1-10 Cilt Izgarası */}
          <div style={styles.volumeGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((vol) => (
              <button
                key={vol}
                onClick={() => setSelectedVolume(vol)}
                style={styles.volumeBtn(selectedVolume === vol)}
              >
                {vol}. Cilt
              </button>
            ))}
          </div>
        </div>

        {/* Arama */}
        <div style={styles.searchBox}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Diyar ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.input}
            />
            <Search size={16} color="#8b4513" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Liste */}
        <div style={styles.list}>
          {error && (
            <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', borderRadius: '4px', marginBottom: '10px', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8b4513' }}>
              <Loader2 className="animate-spin" style={{ display: 'inline-block', marginRight: '5px' }} />
              {selectedVolume === 0 ? "Tüm Ciltler Taranıyor..." : "Yükleniyor..."}
            </div>
          ) : (
            filteredLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleLocationSelect(loc)}
                style={styles.card(activeLocation?.id === loc.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: activeLocation?.id === loc.id ? '#8b4513' : '#f4e4bc', color: activeLocation?.id === loc.id ? 'white' : '#8b4513' }}>
                    {ICON_MAP[loc.iconType] || <MapPin size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1rem', margin: 0, color: '#2c3e50', fontFamily: "'Cinzel', serif" }}>{loc.title}</h3>
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#5c3a21', margin: '2px 0 0 0' }}>{loc.excerpt}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* HARİTA */}
      <main style={{ flex: 1, position: 'relative', backgroundColor: '#aad3df' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 0 }} />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf6e3', zIndex: 50 }}>
            <Compass className="animate-spin" color="#8b4513" size={48} />
            <p style={{ color: '#8b4513', fontSize: '1.5rem', fontFamily: "'Cinzel', serif", marginTop: '10px' }}>Harita Hazırlanıyor...</p>
          </div>
        )}
      </main>

      {/* DETAY PANELİ */}
      <div style={styles.detailPanel}>
        {activeLocation && (
          <>
            <button onClick={() => setActiveLocation(null)} style={{ position: 'absolute', top: '10px', right: '10px', padding: '5px', cursor: 'pointer', background: 'white', borderRadius: '50%', border: 'none', zIndex: 40, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <X color="#8b4513" size={20} />
            </button>

            <div style={{ height: isMobile ? '150px' : '200px', backgroundColor: '#5c3a21', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderTopLeftRadius: isMobile ? '16px' : '8px', borderTopRightRadius: isMobile ? '16px' : '8px' }}>
              {activeLocation.images && activeLocation.images[0] ? (
                <img src={activeLocation.images[0]} alt={activeLocation.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#e6d2b5', transform: 'scale(3)' }}>
                  {ICON_MAP[activeLocation.iconType]}
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '15px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                <h2 style={{ color: 'white', margin: 0, fontFamily: "'Cinzel', serif", fontSize: '1.5rem' }}>{activeLocation.title}</h2>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '4px 10px', backgroundColor: '#f4e4bc', color: '#8b4513', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {activeLocation.type === 'city' ? 'Şehir' : 'Bölge'}
                </span>
                <div style={{ height: '1px', flex: 1, backgroundColor: '#e6d2b5' }}></div>
              </div>

              <div style={{ backgroundColor: '#fffdf5', padding: '15px', borderLeft: '4px solid #8b4513', borderRadius: '4px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#8b4513', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'Cinzel', serif" }}>
                  <Scroll size={16} /> Evliya Diyor ki:
                </h4>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#4a5568', fontSize: '0.9rem' }}>"{activeLocation.description}"</p>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Cinzel', serif", color: '#8b4513', borderBottom: '1px solid #e6d2b5', paddingBottom: '5px', marginBottom: '10px' }}>Seyahat Notları</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#2c3e50' }}>{activeLocation.detail}</p>
              </div>

              {/* Video Bölümü */}
              {activeLocation.video && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", color: '#8b4513', borderBottom: '1px solid #e6d2b5', paddingBottom: '5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Video size={18} /> Video Gezisi
                  </h4>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <iframe
                      src={activeLocation.video.replace('watch?v=', 'embed/')}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${activeLocation.title} Video`}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}