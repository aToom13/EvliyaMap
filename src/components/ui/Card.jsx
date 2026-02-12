import React from 'react';
import {
    BookOpen, Scroll, Landmark, Waves, Mountain,
    Compass, Anchor, Sun, MapPin
} from 'lucide-react';

// İkon haritası
export const ICON_MAP = {
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

/**
 * Konum kartı bileşeni
 */
export function LocationCard({ location, isActive, onClick }) {
    const cardStyle = {
        padding: '12px',
        marginBottom: '10px',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        backgroundColor: isActive ? '#ffffff' : 'var(--color-bg-cream)',
        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
        transition: 'all var(--transition-fast)',
    };

    const iconContainerStyle = {
        padding: '8px',
        borderRadius: '50%',
        backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-warm)',
        color: isActive ? 'white' : 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-fast)',
    };

    return (
        <div
            onClick={onClick}
            style={cardStyle}
            className="animate-fade-in"
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={iconContainerStyle}>
                    {ICON_MAP[location.iconType] || <MapPin size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        margin: 0,
                        color: 'var(--color-text-dark)',
                        fontFamily: "'Cinzel', serif"
                    }}>
                        {location.title}
                    </h3>
                    <p style={{
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                        color: 'var(--color-primary-dark)',
                        margin: '2px 0 0 0'
                    }}>
                        {location.excerpt}
                    </p>
                    {location.type && (
                        <span style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            padding: '2px 6px',
                            fontSize: '0.65rem',
                            backgroundColor: 'var(--color-bg-warm)',
                            color: 'var(--color-primary)',
                            borderRadius: '3px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                        }}>
                            {location.type === 'city' ? 'Şehir' : location.type}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LocationCard;
