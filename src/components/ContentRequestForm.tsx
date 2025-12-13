import { useState, ChangeEvent, useEffect } from 'react';
import { ContentRequest, Intent, Cta, Length, SalesLevel, Platform, Format } from '../types';
import { Wand2, Upload, Trash2 } from 'lucide-react';

interface Props {
    onGenerate: (req: ContentRequest) => void;
    brandName?: string;
    onEditBrand?: () => void;
    logoBase64?: string | null;
}

const INTENTS: Intent[] = ['informar', 'vender', 'invitar', 'felicitar', 'entretener'];
const INTENT_LABELS: Record<Intent, string> = {
    informar: 'Informar / Educar',
    vender: 'Vender',
    invitar: 'Invitar',
    felicitar: 'Felicitar',
    entretener: 'Entretener'
}

const CTAS: Cta[] = ['dm', 'whatsapp', 'seguir', 'agendar', 'descargar'];
const CTA_LABELS: Record<Cta, string> = {
    dm: 'Enviar DM',
    whatsapp: 'WhatsApp',
    seguir: 'Seguir',
    agendar: 'Agendar cita',
    descargar: 'Descargar recurso'
}

const LENGTHS: Length[] = ['short', 'medium', 'long'];
const LENGTH_LABELS: Record<Length, string> = {
    short: 'Corto',
    medium: 'Medio',
    long: 'Largo'
}

const SALES: SalesLevel[] = ['soft', 'hard', 'none'];
const SALES_LABELS: Record<SalesLevel, string> = {
    soft: 'Suave (Soft Sell)',
    hard: 'Directo (Hard Sell)',
    none: 'Ninguno'
}

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'linkedin'];
const PLATFORM_LABELS: Record<Platform, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn'
}

const FORMATS: Format[] = ['post', 'reel', 'story', 'carousel'];
const FORMAT_LABELS: Record<Format, string> = {
    post: 'Publicación (Imagen)',
    reel: 'Reel / Video Corto',
    story: 'Historia',
    carousel: 'Carrusel'
}

export function ContentRequestForm({ onGenerate, brandName, onEditBrand, logoBase64 }: Props) {
    const [request, setRequest] = useState<ContentRequest>({
        mode: 'instant',
        platform: 'instagram',
        format: 'post',
        pillar: 'General',
        keywords: '',
        intent: 'informar',
        cta: 'dm',
        length: 'medium',
        salesLevel: 'soft',
        eventDate: '',
        heroImageBase64: null
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const lastHero = localStorage.getItem('evx.lastHero.v1');
        if (lastHero) {
            setRequest(prev => ({ ...prev, heroImageBase64: lastHero }));
        }
    }, []);

    const handleChange = (field: keyof ContentRequest, value: any) => {
        setRequest(p => ({ ...p, [field]: value }));
        setError('');
    };

    const handleHeroUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("El tamaño máximo es 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                handleChange('heroImageBase64', base64);
                localStorage.setItem('evx.lastHero.v1', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateClick = () => {
        if (!request.heroImageBase64) {
            setError('Sube tu imagen (protagonista)');
            return;
        }
        if (!request.keywords.trim()) {
            setError('Ingresa al menos una palabra clave');
            return;
        }
        onGenerate(request);
    };

    return (
        <div className="container animate-enter" style={{ maxWidth: 700 }}>
            {/* Brand Chip */}
            {brandName && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '0.75rem 1.25rem', borderRadius: 16, marginBottom: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {logoBase64 ? (
                            <img src={logoBase64} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', opacity: 0.2 }} />
                        )}
                        <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>Base cargada</span>
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{brandName}</span>
                        </div>
                    </div>
                    <button onClick={onEditBrand} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 8 }}>
                        Editar base
                    </button>
                </div>
            )}

            {error && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontWeight: 600, border: '1px solid #fca5a5' }}>
                    {error}
                </div>
            )}

            <div className="card">
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wand2 className="text-[var(--primary)]" /> Crear contenido
                </h2>

                <div className="grid-2">
                    <div className="input-group">
                        <label className="label">Modo</label>
                        <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
                            <button
                                onClick={() => handleChange('mode', 'instant')}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', background: request.mode === 'instant' ? 'var(--surface)' : 'transparent', color: request.mode === 'instant' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, boxShadow: request.mode === 'instant' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                            >
                                Inmediato
                            </button>
                            <button
                                onClick={() => handleChange('mode', 'planning')}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', background: request.mode === 'planning' ? 'var(--surface)' : 'transparent', color: request.mode === 'planning' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, boxShadow: request.mode === 'planning' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                            >
                                Planeación
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Pilar de contenido</label>
                        <select className="select" value={request.pillar} onChange={e => handleChange('pillar', e.target.value)}>
                            <option>General</option>
                            <option>Educación / Tips</option>
                            <option>Detrás de escenas</option>
                            <option>Producto / Servicio</option>
                            <option>Testimonios</option>
                            <option>Tendencias / Viral</option>
                        </select>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="input-group">
                        <label className="label">Plataforma</label>
                        <select className="select" value={request.platform} onChange={e => handleChange('platform', e.target.value)}>
                            {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="label">Formato</label>
                        <select className="select" value={request.format} onChange={e => handleChange('format', e.target.value)}>
                            {FORMATS.map(f => <option key={f} value={f}>{FORMAT_LABELS[f]}</option>)}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label className="label">Palabras clave (separadas por coma)</label>
                    <input
                        className="input"
                        placeholder="Ej. impuestos, sat, cierre anual"
                        value={request.keywords}
                        onChange={e => handleChange('keywords', e.target.value)}
                    />
                </div>

                <div className="grid-2">
                    <div className="input-group">
                        <label className="label">Intención</label>
                        <select className="select" value={request.intent} onChange={e => handleChange('intent', e.target.value)}>
                            {INTENTS.map(t => <option key={t} value={t}>{INTENT_LABELS[t]}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="label">CTA (Llamado a la acción)</label>
                        <select className="select" value={request.cta} onChange={e => handleChange('cta', e.target.value)}>
                            {CTAS.map(t => <option key={t} value={t}>{CTA_LABELS[t]}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="input-group">
                        <label className="label">Longitud</label>
                        <select className="select" value={request.length} onChange={e => handleChange('length', e.target.value)}>
                            {LENGTHS.map(t => <option key={t} value={t}>{LENGTH_LABELS[t]}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="label">Nivel de venta</label>
                        <select className="select" value={request.salesLevel} onChange={e => handleChange('salesLevel', e.target.value)}>
                            {SALES.map(t => <option key={t} value={t}>{SALES_LABELS[t]}</option>)}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label className="label">Fecha del evento (Opcional)</label>
                    <input type="date" className="input" value={request.eventDate} onChange={e => handleChange('eventDate', e.target.value)} />
                </div>

                <div className="input-group">
                    <label className="label">Tu imagen (Protagonista) - Obligatorio</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                            <Upload size={18} /> {request.heroImageBase64 ? 'Cambiar imagen' : 'Subir imagen'}
                            <input type="file" hidden accept="image/*" onChange={handleHeroUpload} />
                        </label>
                        {request.heroImageBase64 && (
                            <div style={{ position: 'relative', width: 80, height: 80, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                <img src={request.heroImageBase64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    onClick={() => handleChange('heroImageBase64', null)}
                                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', padding: 2 }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleGenerateClick}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.25rem' }}
                >
                    <Wand2 /> Generar contenido
                </button>

            </div>
        </div>
    );
}
