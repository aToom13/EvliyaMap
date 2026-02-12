import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { Sidebar } from '../components/layout/Sidebar';
import { MapCanvas } from '../components/map/MapCanvas';
import { LocationDetail } from '../components/ui/LocationDetail';

/**
 * Ana sayfa bileşeni - tüm alt bileşenleri bir araya getirir
 */
export default function Home() {
    const [selectedVolume, setSelectedVolume] = useState(0); // 0 = Tüm Ciltler
    const [activeLocation, setActiveLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const { locations, loading, error } = useLocations(selectedVolume);

    // Ekran boyutu değişimini dinle
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cilt değiştiğinde aktif konumu sıfırla
    useEffect(() => {
        setActiveLocation(null);
    }, [selectedVolume]);

    // useCallback ile memoize - gereksiz harita yeniden başlatmayı önler
    const handleLocationSelect = useCallback((location) => {
        setActiveLocation(location);
    }, []);

    const handleVolumeChange = useCallback((volume) => {
        setSelectedVolume(volume);
    }, []);

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg-paper)',
            fontFamily: "'Merriweather', serif",
            position: 'relative'
        }}>
            {/* Mobil Menü Butonu */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 25,
                    padding: '12px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    display: isMobile ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform var(--transition-fast)'
                }}
            >
                <BookOpen size={24} />
            </button>

            {/* Overlay (Mobilde sidebar açıkken) */}
            <div
                onClick={() => setSidebarOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 15,
                    display: (isMobile && sidebarOpen) ? 'block' : 'none',
                    transition: 'opacity var(--transition-normal)'
                }}
            />

            {/* Yan Panel */}
            <Sidebar
                locations={locations}
                activeLocation={activeLocation}
                selectedVolume={selectedVolume}
                searchQuery={searchQuery}
                loading={loading}
                error={error}
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
                onLocationSelect={handleLocationSelect}
                onVolumeChange={handleVolumeChange}
                onSearchChange={setSearchQuery}
                onCloseSidebar={() => setSidebarOpen(false)}
            />

            {/* Harita */}
            <MapCanvas
                locations={locations}
                activeLocation={activeLocation}
                onLocationSelect={handleLocationSelect}
                mapReady={mapReady}
                setMapReady={setMapReady}
            />

            {/* Detay Paneli */}
            {activeLocation && (
                <LocationDetail
                    location={activeLocation}
                    onClose={() => setActiveLocation(null)}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
}
