import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * İskelet yükleme kartı - veri yüklenirken gösterilir
 */
export function SkeletonCard() {
    return (
        <div style={{
            padding: '12px',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-cream)',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                    className="skeleton"
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        flexShrink: 0
                    }}
                />
                <div style={{ flex: 1 }}>
                    <div
                        className="skeleton"
                        style={{
                            height: '18px',
                            width: '70%',
                            marginBottom: '8px'
                        }}
                    />
                    <div
                        className="skeleton"
                        style={{
                            height: '14px',
                            width: '50%'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Yükleme durumunu gösteren bileşen
 */
export function LoadingState({ message = "Yükleniyor..." }) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '20px',
            color: 'var(--color-primary)'
        }}>
            <Loader2
                className="animate-spin"
                style={{
                    display: 'inline-block',
                    marginRight: '8px',
                    verticalAlign: 'middle'
                }}
            />
            <span>{message}</span>
        </div>
    );
}

/**
 * Hata mesajı bileşeni
 */
export function ErrorMessage({ message }) {
    if (!message) return null;

    return (
        <div style={{
            padding: '10px',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            fontSize: '0.8rem',
            borderRadius: '4px',
            marginBottom: '10px',
            border: '1px solid #fecaca'
        }}>
            {message}
        </div>
    );
}

export default { SkeletonCard, LoadingState, ErrorMessage };
