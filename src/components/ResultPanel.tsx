import { useState } from 'react';
import { GeneratedContent } from '../types';
import { Download, ArrowLeft, Copy, Image as ImageIcon, Type, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    result: GeneratedContent;
    onBack: () => void;
}

export function ResultPanel({ result, onBack }: Props) {
    const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('evx.n8n.webhook.v1') || '');
    const [n8nMode, setN8nMode] = useState<'test' | 'prod'>(() => {
        const saved = localStorage.getItem('evx.n8n.webhook.v1') || '';
        return saved.includes('/webhook-test/') ? 'test' : 'prod';
    });
    const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [sendMessage, setSendMessage] = useState('');

    const handleDownload = () => {
        if (!result.finalJson) return;
        const blob = new Blob([JSON.stringify(result.finalJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-request-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles');
    };

    const handleWebhookChange = (val: string) => {
        let newVal = val;
        // Enforce Prod mode constraints immediately
        if (n8nMode === 'prod' && newVal.includes('/webhook-test/')) {
            newVal = newVal.replace('/webhook-test/', '/webhook/');
        }
        setWebhookUrl(newVal);
        localStorage.setItem('evx.n8n.webhook.v1', newVal);
        if (sendStatus !== 'idle') setSendStatus('idle');
    };

    const toggleN8nMode = (mode: 'test' | 'prod') => {
        setN8nMode(mode);
        let newUrl = webhookUrl;
        if (mode === 'prod') {
            newUrl = newUrl.replace('/webhook-test/', '/webhook/');
        } else {
            newUrl = newUrl.replace('/webhook/', '/webhook-test/');
        }
        setWebhookUrl(newUrl);
        localStorage.setItem('evx.n8n.webhook.v1', newUrl);
    };

    const handleSendToN8n = async () => {
        if (!webhookUrl) return;

        // 1. Construir payload FINAL asegurando objetos
        const baseJson = result.finalJson ?? {};
        const payload: any = {
            ...baseJson,
            brand: { ...(baseJson.brand ?? {}) },
            request: { ...(baseJson.request ?? {}) }
        };

        // 2. Resolver imágenes con prioridad estricta
        const resolvedLogo = payload.brand.logoBase64
            ?? payload.brand.logoPreview
            ?? localStorage.getItem('evx.brandLogo.v1');

        const resolvedHero = payload.request.heroImageBase64
            ?? payload.request.heroPreview
            ?? localStorage.getItem('evx.lastHero.v1');

        // Asigna al payload final
        payload.brand.logoBase64 = resolvedLogo ?? null;
        payload.request.heroImageBase64 = resolvedHero ?? null;

        // 3. Validar imágenes (ambos deben ser string y empezar con "data:image/")
        const validLogo = typeof payload.brand.logoBase64 === 'string' && payload.brand.logoBase64.startsWith('data:image/');
        const validHero = typeof payload.request.heroImageBase64 === 'string' && payload.request.heroImageBase64.startsWith('data:image/');

        if (!validLogo || !validHero) {
            setSendStatus('error');
            setSendMessage('Faltan imágenes reales (logo/hero). Vuelve a cargar Logo y Hero.');
            return;
        }

        // 4. Webhook URL Handling
        let targetUrl = webhookUrl;

        // Force Production URL structure if in Prod Mode (Double check)
        if (n8nMode === 'prod') {
            targetUrl = targetUrl.replace('/webhook-test/', '/webhook/');
        }

        // Si el usuario pega localhost:5678, forzar uso del proxy /n8n/
        if (targetUrl.includes('localhost:5678')) {
            targetUrl = targetUrl.replace(/^https?:\/\/localhost:5678\/?/, '/n8n/');
        }
        // Si no empieza con http ni /n8n, asumir es un path relativo a n8n (fallback opcional)
        else if (!targetUrl.startsWith('http') && !targetUrl.startsWith('/n8n')) {
            targetUrl = `/n8n/${targetUrl.replace(/^\//, '')}`;
        }

        // 5. Logging de depuración
        console.log("SEND->N8N URL:", targetUrl);
        console.log("N8N LOGO PREFIX:", payload.brand.logoBase64?.slice(0, 30));
        console.log("N8N HERO PREFIX:", payload.request.heroImageBase64?.slice(0, 30));

        setSendStatus('sending');
        setSendMessage('');

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSendStatus('success');
                setSendMessage('¡Enviado exitosamente a n8n!');
            } else {
                const text = await response.text();
                // Manejo de error 404 modo Test no activo
                if (response.status === 404 && text.includes('webhook is not registered')) {
                    throw new Error("n8n no está en modo Test. En el Webhook node pulsa 'Listen for test event' o usa Production URL.");
                }
                throw new Error(`${response.status} - ${text}`);
            }
        } catch (e: any) {
            console.error("N8N Error:", e);
            setSendStatus('error');
            setSendMessage(e.message || 'Error desconocido al enviar.');
        }
    };

    return (
        <div className="container animate-enter" style={{ maxWidth: 900 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Estrategia generada</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleDownload} className="btn btn-primary">
                        <Download size={18} /> Descargar JSON
                    </button>
                </div>
            </div>

            {/* n8n Integration Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Webhook n8n
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg)', padding: 2, borderRadius: 6, border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => toggleN8nMode('test')}
                                style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: n8nMode === 'test' ? 'var(--primary)' : 'transparent',
                                    color: n8nMode === 'test' ? 'white' : 'var(--text-muted)',
                                    fontWeight: n8nMode === 'test' ? 600 : 400
                                }}
                            >
                                Test
                            </button>
                            <button
                                onClick={() => toggleN8nMode('prod')}
                                style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: n8nMode === 'prod' ? 'var(--primary)' : 'transparent',
                                    color: n8nMode === 'prod' ? 'white' : 'var(--text-muted)',
                                    fontWeight: n8nMode === 'prod' ? 600 : 400
                                }}
                            >
                                Prod
                            </button>
                        </div>
                    </div>
                    <input
                        className="input"
                        style={{ padding: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}
                        placeholder={n8nMode === 'test' ? "/n8n/webhook-test/..." : "/n8n/webhook/..."}
                        value={webhookUrl}
                        onChange={(e) => handleWebhookChange(e.target.value)}
                    />
                    {webhookUrl.includes('/webhook-test/') && (
                        <div style={{
                            fontSize: '0.7rem',
                            color: '#eab308',
                            background: 'rgba(234, 179, 8, 0.1)',
                            padding: '0.5rem',
                            borderRadius: 4,
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'start'
                        }}>
                            <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>Estás usando <strong>TEST URL</strong>. En n8n pulsa 'Listen for test event'. Solo funciona 1 vez. Para prod usa el toggle arriba.</span>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '1rem' }}>
                    <button
                        onClick={handleSendToN8n}
                        disabled={!webhookUrl || sendStatus === 'sending'}
                        className="btn btn-secondary"
                        style={{ height: '38px', padding: '0 1rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                        {sendStatus === 'sending' ? 'Enviando...' : (
                            <>Enviar a n8n <Send size={16} /></>
                        )}
                    </button>
                    {sendMessage && (
                        <span style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: sendStatus === 'success' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {sendStatus === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {sendMessage}
                        </span>
                    )}
                    {!webhookUrl && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Pega tu webhook para enviar</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Text Prompt */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Type size={18} className="text-[var(--primary)]" /> Prompt del sistema
                        </h3>
                        <button onClick={() => copyToClipboard(result.prompt_text)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                            <Copy size={14} /> Copiar
                        </button>
                    </div>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--text)',
                        background: 'var(--bg)',
                        padding: '1rem',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        flex: 1,
                        lineHeight: 1.5
                    }}>
                        {result.prompt_text}
                    </pre>
                </div>

                {/* Image Prompt */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ImageIcon size={18} className="text-[var(--primary)]" /> Prompt de imagen
                        </h3>
                        <button onClick={() => copyToClipboard(result.prompt_image)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                            <Copy size={14} /> Copiar
                        </button>
                    </div>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--text)',
                        background: 'var(--bg)',
                        padding: '1rem',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        flex: 1,
                        lineHeight: 1.5
                    }}>
                        {result.prompt_image}
                    </pre>
                </div>

            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Metadatos (JSON Estricto para n8n)</h3>
                <pre style={{ fontSize: '0.75rem', overflowX: 'auto', background: 'var(--bg)', padding: '1rem', borderRadius: 8 }}>
                    {JSON.stringify(result.finalJson, null, 2)}
                </pre>
            </div>

        </div>
    );
}
