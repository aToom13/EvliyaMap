import React, { useState, useMemo } from 'react';
import { Scroll, Search, Globe, X, Filter, ChevronDown, ChevronUp, MapPin, Landmark, Building, TreePine } from 'lucide-react';
import { LocationCard } from '../ui/Card';
import { SkeletonCard, ErrorMessage } from '../ui/LoadingStates';

// Tür kategorileri ve ikonları
const TYPE_CATEGORIES = {
    all: { label: 'Tümü', icon: Globe },
    city: { label: 'Şehir', icon: Building },
    landmark: { label: 'Anıt', icon: Landmark },
    region: { label: 'Bölge', icon: MapPin },
    nature: { label: 'Doğa', icon: TreePine },
};

/**
 * Gelişmiş Yan Menü - Arama, Filtreleme, Cilt Seçimi
 */
export function Sidebar({
    locations,
    activeLocation,
    selectedVolume,
    searchQuery,
    loading,
    error,
    isMobile,
    sidebarOpen,
    onLocationSelect,
    onVolumeChange,
    onSearchChange,
    onCloseSidebar
}) {
    const [selectedType, setSelectedType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showVolumeSelector, setShowVolumeSelector] = useState(false);

    // Mevcut türleri hesapla
    const availableTypes = useMemo(() => {
        const types = new Set(locations.map(loc => loc.type || 'other'));
        return ['all', ...Array.from(types)];
    }, [locations]);

    // Filtreleme
    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch =
                loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === 'all' || loc.type === selectedType;

            return matchesSearch && matchesType;
        });
    }, [locations, searchQuery, selectedType]);

    // Sonuç sayısı
    const resultCount = filteredLocations.length;
    const totalCount = locations.length;

    const sidebarStyle = {
        width: isMobile ? '100%' : 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isMobile ? 'none' : '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-paper)',
        zIndex: 20,
        flexShrink: 0,
        boxShadow: 'var(--shadow-lg)',
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? 0 : '-100%') : 'auto',
        top: 0,
        bottom: 0,
        transition: 'left var(--transition-normal)',
        maxWidth: isMobile ? '90vw' : 'var(--sidebar-width)'
    };

    return (
        <aside style={sidebarStyle}>
            {/* Header */}
            <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                color: 'white',
                position: 'relative'
            }}>
                {isMobile && (
                    <button
                        onClick={onCloseSidebar}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={18} color="white" />
                    </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Scroll size={32} />
                    <div>
                        <h1 style={{
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            margin: 0,
                            fontFamily: "'Cinzel', serif"
                        }}>
                            Seyahatname
                        </h1>
                        <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: 0, fontStyle: 'italic' }}>
                            Evliya Çelebi'nin İzinde
                        </p>
                    </div>
                </div>
            </div>

            {/* Arama ve Filtreler */}
            <div style={{
                padding: '16px',
                backgroundColor: 'var(--color-bg-cream)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                {/* Arama */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <input
                        type="text"
                        placeholder="Diyar, belde, mekan ara..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-card)',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            color: 'var(--color-text-dark)',
                            outline: 'none',
                            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139, 69, 19, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-border)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'var(--color-bg-warm)',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex'
                            }}
                        >
                            <X size={14} color="var(--color-text-muted)" />
                        </button>
                    )}
                </div>

                {/* Filtre ve Cilt Butonları */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Tür Filtresi */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: showFilters ? 'var(--color-primary)' : 'var(--color-bg-card)',
                            color: showFilters ? 'white' : 'var(--color-text-dark)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <Filter size={16} />
                        Filtre
                        {selectedType !== 'all' && (
                            <span style={{
                                backgroundColor: showFilters ? 'rgba(255,255,255,0.3)' : 'var(--color-primary)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '0.7rem'
                            }}>1</span>
                        )}
                    </button>

                    {/* Cilt Seçici */}
                    <button
                        onClick={() => setShowVolumeSelector(!showVolumeSelector)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px',
                            borderRadius: '10px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: showVolumeSelector ? 'var(--color-primary)' : 'var(--color-bg-card)',
                            color: showVolumeSelector ? 'white' : 'var(--color-text-dark)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <Globe size={16} />
                        {selectedVolume === 0 ? 'Tümü' : `Cilt ${selectedVolume}`}
                        {showVolumeSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {/* Tür Filtre Panel */}
                {showFilters && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--color-bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)'
                    }} className="animate-slide-up">
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                        }}>
                            {availableTypes.map(type => {
                                const category = TYPE_CATEGORIES[type] || { label: type, icon: MapPin };
                                const Icon = category.icon;
                                const isActive = selectedType === type;

                                return (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedType(type)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-warm)',
                                            color: isActive ? 'white' : 'var(--color-text-dark)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            transition: 'all var(--transition-fast)'
                                        }}
                                    >
                                        <Icon size={14} />
                                        {category.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cilt Seçici Panel */}
                {showVolumeSelector && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--color-bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)'
                    }} className="animate-slide-up">
                        {/* Tüm Ciltler */}
                        <button
                            onClick={() => { onVolumeChange(0); setShowVolumeSelector(false); }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                marginBottom: '10px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: selectedVolume === 0 ? 'var(--color-primary)' : 'var(--color-bg-warm)',
                                color: selectedVolume === 0 ? 'white' : 'var(--color-text-dark)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontFamily: "'Cinzel', serif",
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            <Globe size={18} />
                            Tüm Ciltleri Göster
                        </button>

                        {/* Cilt Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '6px'
                        }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((vol) => (
                                <button
                                    key={vol}
                                    onClick={() => { onVolumeChange(vol); setShowVolumeSelector(false); }}
                                    style={{
                                        padding: '10px 4px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: selectedVolume === vol ? 'var(--color-primary)' : 'var(--color-bg-warm)',
                                        color: selectedVolume === vol ? 'white' : 'var(--color-text-dark)',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                >
                                    {vol}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sonuç Sayısı */}
            <div style={{
                padding: '10px 16px',
                backgroundColor: 'var(--color-bg-paper)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>
                    <strong style={{ color: 'var(--color-primary)' }}>{resultCount}</strong> yer bulundu
                    {resultCount !== totalCount && ` (toplam ${totalCount})`}
                </span>
                {(searchQuery || selectedType !== 'all') && (
                    <button
                        onClick={() => { onSearchChange(''); setSelectedType('all'); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                        }}
                    >
                        Filtreleri Temizle
                    </button>
                )}
            </div>

            {/* Konum Listesi */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                <ErrorMessage message={error} />

                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    filteredLocations.map((loc, index) => (
                        <div key={`${loc.id}-${index}`} style={{ animationDelay: `${index * 30}ms` }} className="animate-fade-in">
                            <LocationCard
                                location={loc}
                                isActive={activeLocation?.id === loc.id}
                                onClick={() => onLocationSelect(loc)}
                            />
                        </div>
                    ))
                )}

                {!loading && filteredLocations.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--color-text-muted)'
                    }}>
                        <MapPin size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontWeight: '500' }}>Sonuç bulunamadı</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem' }}>
                            Farklı anahtar kelimeler deneyin
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
