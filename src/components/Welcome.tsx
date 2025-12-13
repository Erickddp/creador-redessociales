import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';

interface Props {
    onStart: () => void;
    hasSavedBrand: boolean;
    onGoToContent: () => void;
}

export function Welcome({ onStart, hasSavedBrand, onGoToContent }: Props) {
    return (
        <div className="container" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div className="animate-enter">
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                    width: 96, height: 96, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem',
                    boxShadow: '0 20px 50px -15px var(--primary)'
                }}>
                    <Sparkles color="white" size={48} />
                </div>

                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                    Tu Estratega de <br />
                    <span style={{
                        background: 'linear-gradient(to right, var(--primary), #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Contenido IA Personal</span>
                </h1>

                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 3rem', lineHeight: 1.6 }}>
                    Define el ADN de tu marca una vez. Genera contenido infinito y ultra-dirigido que realmente suene a ti.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={onStart} className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 3rem', height: 'auto' }}>
                        {hasSavedBrand ? 'Configurar nueva base' : 'Empezar ahora'} <ArrowRight size={20} />
                    </button>

                    {hasSavedBrand && (
                        <button onClick={onGoToContent} className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 3rem', height: 'auto' }}>
                            Ir a Crear Contenido <LayoutDashboard size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
