import React from 'react';
import { X, Scroll, Video } from 'lucide-react';
import { ICON_MAP } from '../ui/Card';

/**
 * Konum detay paneli
 */
export function LocationDetail({ location, onClose, isMobile }) {
    if (!location) return null;

    const panelStyle = {
        position: 'absolute',
        top: isMobile ? 'auto' : '20px',
        right: isMobile ? 0 : '20px',
        bottom: isMobile ? 0 : '20px',
        left: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : 'var(--detail-width)',
        height: isMobile ? '60vh' : 'auto',
        backgroundColor: 'white',
        border: '1px solid var(--color-border-dark)',
        borderRadius: isMobile ? '16px 16px 0 0' : '8px',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
    };

    return (
        <div style={panelStyle} className="animate-slide-up">
            {/* Kapat Butonu */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '8px',
                    cursor: 'pointer',
                    background: 'white',
                    borderRadius: '50%',
                    border: 'none',
                    zIndex: 40,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform var(--transition-fast)'
                }}
            >
                <X color="var(--color-primary)" size={20} />
            </button>

            {/* Görsel veya İkon */}
            <div style={{
                height: isMobile ? '150px' : '200px',
                backgroundColor: 'var(--color-primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {location.images && location.images[0] ? (
                    <img
                        src={location.images[0]}
                        alt={location.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ color: 'var(--color-border)', transform: 'scale(3)' }}>
                        {ICON_MAP[location.iconType]}
                    </div>
                )}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                }}>
                    <h2 style={{
                        color: 'white',
                        margin: 0,
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.5rem'
                    }}>
                        {location.title}
                    </h2>
                </div>
            </div>

            {/* İçerik */}
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                {/* Tür Etiketi */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--color-bg-warm)',
                        color: 'var(--color-primary)',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                    }}>
                        {location.type === 'city' ? 'Şehir' : 'Bölge'}
                    </span>
                    <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
                </div>

                {/* Evliya Alıntısı */}
                <div style={{
                    backgroundColor: 'var(--color-bg-cream)',
                    padding: '15px',
                    borderLeft: '4px solid var(--color-primary)',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{
                        margin: '0 0 5px 0',
                        color: 'var(--color-primary)',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontFamily: "'Cinzel', serif"
                    }}>
                        <Scroll size={16} /> Evliya Diyor ki:
                    </h4>
                    <p style={{
                        margin: 0,
                        fontStyle: 'italic',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        "{location.description}"
                    </p>
                </div>

                {/* Seyahat Notları */}
                <div>
                    <h4 style={{
                        fontFamily: "'Cinzel', serif",
                        color: 'var(--color-primary)',
                        borderBottom: '1px solid var(--color-border)',
                        paddingBottom: '5px',
                        marginBottom: '10px'
                    }}>
                        Seyahat Notları
                    </h4>
                    <p style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        color: 'var(--color-text-dark)'
                    }}>
                        {location.detail}
                    </p>
                </div>

                {/* Video Bölümü */}
                {location.video && (
                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{
                            fontFamily: "'Cinzel', serif",
                            color: 'var(--color-primary)',
                            borderBottom: '1px solid var(--color-border)',
                            paddingBottom: '5px',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <Video size={18} /> Video Gezisi
                        </h4>
                        <div style={{
                            position: 'relative',
                            paddingBottom: '56.25%',
                            height: 0,
                            overflow: 'hidden',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <iframe
                                src={location.video.replace('watch?v=', 'embed/')}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '8px'
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={`${location.title} Video`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LocationDetail;
