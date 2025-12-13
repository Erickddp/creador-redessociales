import { useState } from 'react';
import { GeneratedContent } from '../types';
import { Download, ArrowLeft, Copy, Image as ImageIcon, Type, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    result: GeneratedContent;
    onBack: () => void;
}

export function ResultPanel({ result, onBack }: Props) {
    const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('evx.n8n.webhook.v1') || '');
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
        setWebhookUrl(val);
        localStorage.setItem('evx.n8n.webhook.v1', val);
        if (sendStatus !== 'idle') setSendStatus('idle');
    };

    const handleSendToN8n = async () => {
        if (!webhookUrl) return;
        setSendStatus('sending');
        setSendMessage('');
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.finalJson)
            });

            if (response.ok) {
                setSendStatus('success');
                setSendMessage('¡Enviado exitosamente!');
            } else {
                throw new Error(`Error ${response.status}`);
            }
        } catch (e) {
            setSendStatus('error');
            setSendMessage('Error al enviar. Revisa la URL o CORS.');
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
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Webhook n8n
                    </label>
                    <input
                        className="input"
                        style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                        placeholder="https://su-instancia-n8n.com/webhook/..."
                        value={webhookUrl}
                        onChange={(e) => handleWebhookChange(e.target.value)}
                    />
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
