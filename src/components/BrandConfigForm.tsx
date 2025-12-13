import { useState, ChangeEvent } from 'react';
import { BrandConfig, Tone, Goal, VisualStyle } from '../types';
import { Save, Upload, Trash2 } from 'lucide-react';

interface Props {
    initialData: BrandConfig;
    onSave: (data: BrandConfig) => void;
    onCancel: () => void;
}

const TONES: Tone[] = ['professional', 'friendly', 'witty', 'empathetic', 'authoritative', 'bold'];
const TONE_LABELS: Record<Tone, string> = {
    professional: 'Profesional',
    friendly: 'Amigable',
    witty: 'Ingenioso',
    empathetic: 'Empático',
    authoritative: 'Autoridad',
    bold: 'Atrevido'
};

const GOALS: Goal[] = ['awareness', 'conversion', 'engagement', 'loyalty'];
const GOAL_LABELS: Record<Goal, string> = {
    awareness: 'Generar audiencia',
    conversion: 'Conseguir clientes',
    engagement: 'Engagement',
    loyalty: 'Fidelización'
}

const VISUALS: VisualStyle[] = ['minimalist', 'colorful', 'corporate', 'artistic', 'futuristic'];
const VISUAL_LABELS: Record<VisualStyle, string> = {
    minimalist: 'Minimalista',
    colorful: 'Colorido',
    corporate: 'Corporativo',
    artistic: 'Artístico',
    futuristic: 'Futurista'
};

const PLATFORMS_LIST = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Facebook', 'Blog'];

export function BrandConfigForm({ initialData, onSave, onCancel }: Props) {
    const [formData, setFormData] = useState<BrandConfig>(initialData);
    const [error, setError] = useState('');

    const handleChange = (field: keyof BrandConfig, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...formData.services];
        newServices[index] = value;
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const handlePlatformToggle = (platform: string) => {
        const current = formData.platforms;
        if (current.includes(platform)) {
            handleChange('platforms', current.filter(p => p !== platform));
        } else {
            handleChange('platforms', [...current, platform]);
        }
    };

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("El tamaño máximo es 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('logoBase64', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateAndSave = () => {
        if (!formData.logoBase64) {
            setError('Sube el logo (obligatorio)');
            return;
        }
        if (!formData.brandName) {
            setError('Falta el nombre de la marca');
            return;
        }
        onSave(formData);
    }

    return (
        <div className="container animate-enter" style={{ maxWidth: 900 }}>
            {error && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontWeight: 600, border: '1px solid #fca5a5' }}>
                    {error}
                </div>
            )}
            <div className="card">
                <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 700 }}>Configuración base de la marca</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Identity Section */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Identidad principal</h3>

                        <div className="input-group">
                            <label className="label">Nombre de la marca</label>
                            <input className="input" value={formData.brandName} onChange={e => handleChange('brandName', e.target.value)} placeholder="Ej. EVORIX" />
                        </div>

                        <div className="input-group">
                            <label className="label">Logo (Obligatorio)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                    <Upload size={18} /> {formData.logoBase64 ? 'Cambiar logo' : 'Subir logo'}
                                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                </label>
                                {formData.logoBase64 && (
                                    <div style={{ position: 'relative', width: 60, height: 60, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                        <img src={formData.logoBase64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => handleChange('logoBase64', null)}
                                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', padding: 2 }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Lo que haces (En una frase)</label>
                            <textarea className="textarea" rows={2} value={formData.whatIDo} onChange={e => handleChange('whatIDo', e.target.value)} placeholder="Ej. Soluciones de ciberseguridad para fintechs." />
                        </div>

                        <div className="input-group">
                            <label className="label">Servicios clave</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {formData.services.map((s, i) => (
                                    <input key={i} className="input" value={s} onChange={e => handleServiceChange(i, e.target.value)} placeholder={`Servicio ${i + 1}`} />
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Audiencia objetivo</label>
                            <input className="input" value={formData.audience} onChange={e => handleChange('audience', e.target.value)} placeholder="Ej. CTOs de startups en crecimiento" />
                        </div>
                    </div>

                    {/* Style & Strategy Section */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Estilo y estrategia</h3>

                        <div className="grid-2">
                            <div className="input-group">
                                <label className="label">Tono</label>
                                <select className="select" value={formData.tone} onChange={e => handleChange('tone', e.target.value)}>
                                    {TONES.map(t => <option key={t} value={t}>{TONE_LABELS[t]}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="label">Objetivo principal</label>
                                <select className="select" value={formData.mainGoal} onChange={e => handleChange('mainGoal', e.target.value)}>
                                    {GOALS.map(t => <option key={t} value={t}>{GOAL_LABELS[t]}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Estilo visual</label>
                            <select className="select" value={formData.visualStyle} onChange={e => handleChange('visualStyle', e.target.value)}>
                                {VISUALS.map(t => <option key={t} value={t}>{VISUAL_LABELS[t]}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="label">Nivel de realismo (0-100): {formData.realismRange}</label>
                            <input
                                type="range" min="0" max="100"
                                value={formData.realismRange}
                                onChange={e => handleChange('realismRange', parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary)' }}
                            />
                        </div>

                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.noTextInImages}
                                onChange={e => handleChange('noTextInImages', e.target.checked)}
                                style={{ width: 20, height: 20 }}
                            />
                            <span style={{ fontSize: '0.9rem' }}>Sin texto en imágenes (Obligatorio)</span>
                        </div>

                        <div className="input-group">
                            <label className="label">Plataformas activas</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {PLATFORMS_LIST.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handlePlatformToggle(p)}
                                        className={formData.platforms.includes(p) ? 'btn btn-primary' : 'btn btn-secondary'}
                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Estilo de redacción</label>
                            <input className="input" value={formData.writingStyle} onChange={e => handleChange('writingStyle', e.target.value)} placeholder="Ej. Conciso, con emojis, directo" />
                        </div>

                        <div className="input-group">
                            <label className="label">Palabras prohibidas</label>
                            <input className="input" value={formData.forbiddenWords} onChange={e => handleChange('forbiddenWords', e.target.value)} placeholder="Ej. barato, descuento, oferta" />
                        </div>

                    </div>
                </div>

                <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} className="btn btn-secondary">Cancelar</button>
                    <button onClick={validateAndSave} className="btn btn-primary">
                        Guardar base <Save size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
