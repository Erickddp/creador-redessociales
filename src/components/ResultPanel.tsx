import { GeneratedContent } from '../types';
import { Download, ArrowLeft, Copy, Image as ImageIcon, Type } from 'lucide-react';

interface Props {
    result: GeneratedContent;
    onBack: () => void;
}

export function ResultPanel({ result, onBack }: Props) {
    const handleDownload = () => {
        // Use the strict JSON structure from finalJson
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.finalJson, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `content-request-${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="container animate-enter" style={{ maxWidth: 900 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Generated Strategy</h2>
                <button onClick={handleDownload} className="btn btn-primary">
                    <Download size={18} /> Download JSON
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Text Prompt */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Type size={18} className="text-[var(--primary)]" /> System Prompt
                        </h3>
                        <button onClick={() => copyToClipboard(result.prompt_text)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                            <Copy size={14} /> Copy
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
                            <ImageIcon size={18} className="text-[var(--primary)]" /> Image Prompt
                        </h3>
                        <button onClick={() => copyToClipboard(result.prompt_image)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                            <Copy size={14} /> Copy
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
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Raw Metadata (Strict JSON to Export)</h3>
                <pre style={{ fontSize: '0.75rem', overflowX: 'auto', background: 'var(--bg)', padding: '1rem', borderRadius: 8 }}>
                    {JSON.stringify(result.finalJson, null, 2)}
                </pre>
            </div>

        </div>
    );
}
