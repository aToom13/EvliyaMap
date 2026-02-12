import React, { useEffect, useRef, useCallback } from 'react';
import { Compass } from 'lucide-react';

/**
 * İki koordinat arası mesafeyi hesapla (Haversine formülü - km)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Mesafeye göre optimal zoom seviyesi hesapla
 * Daha yakın zoom seviyeleri (Google Maps benzeri)
 */
function getOptimalZoom(distance) {
    if (distance < 1) return 17;      // Çok çok yakın (< 1km) - bina seviyesi
    if (distance < 5) return 16;      // Çok yakın (< 5km) - sokak seviyesi
    if (distance < 15) return 14;     // Yakın (5-15km) - mahalle
    if (distance < 40) return 12;     // Orta yakın (15-40km) - ilçe
    if (distance < 100) return 10;    // Orta (40-100km) - şehir
    if (distance < 300) return 8;     // Orta uzak (100-300km) - bölge
    if (distance < 800) return 6;     // Uzak (300-800km) - ülke
    if (distance < 2000) return 5;    // Çok uzak (800-2000km) - kıta
    return 4;                         // Kıtalar arası
}

/**
 * Mesafeye göre animasyon süresini hesapla (saniye)
 */
function getAnimationDuration(distance, currentZoom, targetZoom) {
    const zoomDiff = Math.abs(currentZoom - targetZoom);

    // Temel süre: mesafeye göre
    let baseDuration;
    if (distance < 10) baseDuration = 0.5;
    else if (distance < 50) baseDuration = 0.8;
    else if (distance < 200) baseDuration = 1.2;
    else if (distance < 1000) baseDuration = 1.8;
    else baseDuration = 2.2;

    // Zoom farkına göre ek süre
    const zoomAdjustment = zoomDiff * 0.15;

    return Math.min(baseDuration + zoomAdjustment, 3); // Max 3 saniye
}

/**
 * Harita bileşeni - Leaflet ile interaktif harita (Geliştirilmiş animasyonlar)
 */
export function MapCanvas({ locations, activeLocation, onLocationSelect, mapReady, setMapReady }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const clusterGroupRef = useRef(null);
    const previousLocationRef = useRef(null);
    const isAnimatingRef = useRef(false);

    // Leaflet Script Yükleme
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

        // MarkerCluster CSS
        const clusterCss = document.createElement("link");
        clusterCss.rel = "stylesheet";
        clusterCss.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
        document.head.appendChild(clusterCss);

        const clusterDefaultCss = document.createElement("link");
        clusterDefaultCss.rel = "stylesheet";
        clusterDefaultCss.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
        document.head.appendChild(clusterDefaultCss);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.id = scriptId;
        script.async = true;
        script.onload = () => {
            const clusterScript = document.createElement("script");
            clusterScript.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
            clusterScript.onload = () => setMapReady(true);
            document.body.appendChild(clusterScript);
        };
        document.body.appendChild(script);
    }, [setMapReady]);

    /**
     * Akıllı harita geçişi - her zaman seçilen konuma doğru yakınlaştır
     */
    const smoothFlyTo = useCallback((targetCoords, previousCoords, map) => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        const currentZoom = map.getZoom();
        const currentCenter = map.getCenter();

        // Hedef zoom seviyesi - detay görünümü için sabit
        const targetZoom = 15;

        // Mevcut merkez ile hedef arası mesafe (sadece animasyon süresi için)
        const distance = calculateDistance(
            currentCenter.lat,
            currentCenter.lng,
            targetCoords[0],
            targetCoords[1]
        );

        // Animasyon süresi: mesafeye göre
        let duration;
        if (distance < 10) duration = 0.8;
        else if (distance < 100) duration = 1.2;
        else if (distance < 500) duration = 1.8;
        else duration = 2.5;

        // Doğrudan hedef koordinatlara git (offset yok)
        const finalCoords = [targetCoords[0], targetCoords[1]];

        // Her zaman flyTo kullan - en pürüzsüz animasyon
        map.flyTo(finalCoords, targetZoom, {
            duration: duration,
            easeLinearity: 0.25
        });

        // Animasyon kilidini serbest bırak
        setTimeout(() => {
            isAnimatingRef.current = false;
        }, duration * 1000 + 200);
    }, []);

    // Harita Başlatma
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
            scrollWheelZoom: true,
            // Pürüzsüz animasyon ayarları
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
            inertia: true,
            inertiaDeceleration: 3000,
            inertiaMaxSpeed: 1500,
            easeLinearity: 0.35,
            worldCopyJump: false,
            maxBoundsViscosity: 0.8,
            attributionControl: false // Sağ alttaki attribution'ı kaldır
        });

        // Harita Tile Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB',
            maxZoom: 19,
            updateWhenIdle: true,
            updateWhenZooming: false,
            keepBuffer: 4
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
        markersRef.current = {};

        // Marker Cluster Grubu - animasyonlar iyileştirildi
        const clusterGroup = L.markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50,
            animate: true,
            animateAddingMarkers: false, // Ekleme animasyonunu kapat (takılma önlenir)
            spiderfyDistanceMultiplier: 1.5,
            spiderLegPolylineOptions: { weight: 1.5, color: '#8b4513', opacity: 0.5 },
            iconCreateFunction: function (cluster) {
                const count = cluster.getChildCount();
                const size = count > 50 ? 44 : count > 20 ? 40 : 36;
                return L.divIcon({
                    html: `<div style="
            background: linear-gradient(135deg, #8b4513 0%, #5c3a21 100%);
            color: white;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${count > 50 ? 16 : 14}px;
            border: 3px solid #fdf6e3;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            transition: transform 0.2s ease;
          ">${count}</div>`,
                    className: 'custom-cluster-icon',
                    iconSize: L.point(size + 4, size + 4)
                });
            }
        });

        clusterGroupRef.current = clusterGroup;

        locations.forEach(loc => {
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="marker-pin" style="
          background-color: #8b4513;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #fdf6e3;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        "></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const marker = L.marker(loc.coords, { icon: customIcon });

            marker.bindTooltip(loc.title, {
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip',
                offset: [0, -10]
            });

            marker.on('click', () => onLocationSelect(loc));
            markersRef.current[loc.id] = marker;
            clusterGroup.addLayer(marker);
        });

        map.addLayer(clusterGroup);

        // Başlangıçta tüm noktaları göster
        if (locations.length > 0) {
            const bounds = clusterGroup.getBounds();
            map.fitBounds(bounds.pad(0.1), { animate: false });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [mapReady, locations, onLocationSelect]);

    // Aktif konum değiştiğinde akıllı geçiş
    useEffect(() => {
        if (!activeLocation || !mapInstanceRef.current) return;

        const previousCoords = previousLocationRef.current?.coords || null;

        // Aynı konuma tekrar tıklandıysa animasyon yapma
        if (previousLocationRef.current?.id === activeLocation.id) return;

        smoothFlyTo(activeLocation.coords, previousCoords, mapInstanceRef.current);
        previousLocationRef.current = activeLocation;
    }, [activeLocation, smoothFlyTo]);

    return (
        <main style={{ flex: 1, position: 'relative', backgroundColor: '#aad3df' }}>
            <style>{`
        .custom-tooltip {
          background: #fdf6e3;
          border: 1px solid #e6d2b5;
          border-radius: 4px;
          padding: 4px 8px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          color: #5c3a21;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .custom-tooltip::before {
          border-top-color: #e6d2b5 !important;
        }
        .marker-pin:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
        }
        .custom-cluster-icon > div:hover {
          transform: scale(1.1);
        }
        .leaflet-fade-anim .leaflet-tile,
        .leaflet-fade-anim .leaflet-popup {
          transition: opacity 0.25s linear;
        }
        .leaflet-zoom-anim .leaflet-zoom-animated {
          will-change: transform;
        }
      `}</style>

            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 0 }} />

            {!mapReady && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fdf6e3',
                    zIndex: 50
                }}>
                    <Compass className="animate-spin" color="#8b4513" size={48} />
                    <p style={{
                        color: '#8b4513',
                        fontSize: '1.5rem',
                        fontFamily: "'Cinzel', serif",
                        marginTop: '10px'
                    }}>
                        Harita Hazırlanıyor...
                    </p>
                </div>
            )}
        </main>
    );
}

export default MapCanvas;
