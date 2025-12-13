import { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { BrandConfigForm } from './components/BrandConfigForm';
import { ContentRequestForm } from './components/ContentRequestForm';
import { ResultPanel } from './components/ResultPanel';
import { BrandConfig, ContentRequest, GeneratedContent, initialBrandConfig } from './types';
import { Moon, Sun, Settings } from 'lucide-react';

const BRAND_STORAGE_KEY = 'evx.brand.v1';

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [step, setStep] = useState<'welcome' | 'config' | 'create' | 'result'>('welcome');
    const [brandConfig, setBrandConfig] = useState<BrandConfig>(initialBrandConfig);
    const [lastResult, setLastResult] = useState<GeneratedContent | null>(null);
    const [hasSavedBrand, setHasSavedBrand] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Load Config on Mount & Logic to skip screen
    useEffect(() => {
        try {
            const saved = localStorage.getItem(BRAND_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setBrandConfig(parsed);
                if (parsed.logoBase64 && parsed.brandName) {
                    setHasSavedBrand(true);
                    setStep('create'); // Auto skip if valid
                }
            }
        } catch (e) {
            console.error("Failed to load config", e);
        }
    }, []);

    const handleStart = () => {
        // Force new config
        setStep('config');
    };

    const handleGoToContent = () => {
        if (hasSavedBrand) {
            setStep('create');
        }
    };

    const handleSaveConfig = (cfg: BrandConfig) => {
        setBrandConfig(cfg);
        localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(cfg));
        setHasSavedBrand(true);
        setStep('create');
    };

    const handleEditConfig = () => {
        setStep('config');
    };

    const handleGenerate = (req: ContentRequest) => {
        // GENERATION LOGIC
        // Prepare keywords
        const keywordsList = req.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

        const promptText = `
ROLE: Act as ${brandConfig.brandName}, a brand that does "${brandConfig.whatIDo}".
TONE: ${brandConfig.tone}.
STYLE: ${brandConfig.writingStyle}.
FORBIDDEN WORDS: ${brandConfig.forbiddenWords}.

TASK: Write a ${req.length} ${req.format} for ${req.platform}.
TOPIC: ${keywordsList.join(', ')}.
GOAL: ${req.intent} (Sales Level: ${req.salesLevel}).
CTA: ${req.cta}.

CONTEXT:
My audience is ${brandConfig.audience}.
${req.eventDate ? `Mention the event on: ${req.eventDate}.` : ''}
    `.trim();

        const promptImage = `
Subject: ${keywordsList[0] || 'Brand Image'}.
Style: ${brandConfig.visualStyle}, Realism Level: ${brandConfig.realismRange}/100.
${brandConfig.noTextInImages ? 'IMPORTANT: No text in the image.' : ''}
Format: ${req.format}.
Hero Image: [User Provided Image]
    `.trim();

        // Construct Strict JSON
        const finalJson = {
            version: "1.0",
            brand: {
                name: brandConfig.brandName,
                oneLiner: brandConfig.whatIDo,
                audience: brandConfig.audience,
                tone: brandConfig.tone,
                goalDefault: brandConfig.mainGoal,
                visualStyle: brandConfig.visualStyle,
                noTextInImages: brandConfig.noTextInImages,
                logoBase64: brandConfig.logoBase64
            },
            request: {
                mode: req.mode,
                platform: req.platform,
                format: req.format,
                pillar: req.pillar,
                keywords: keywordsList,
                intent: req.intent,
                cta: req.cta,
                heroImageBase64: req.heroImageBase64
            },
            prompts: {
                text: promptText,
                imageOrVideo: promptImage
            }
        };

        const result: GeneratedContent = {
            prompt_text: promptText,
            prompt_image: promptImage,
            metadata: {
                timestamp: new Date().toISOString(),
            },
            finalJson: finalJson
        };

        setLastResult(result);
        setStep('result');
    };

    return (
        <div className="app">
            <header className="header container flex items-center" style={{ justifyContent: 'space-between' }}>
                <div className="flex items-center gap-4">
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        IA
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Creador de Contenido IA</h1>
                </div>

                <div className="flex items-center gap-4">
                    {step === 'create' && (
                        <button onClick={handleEditConfig} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            <Settings size={16} /> Configuración
                        </button>
                    )}
                    <button
                        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: '50%', width: 40, height: 40, minWidth: 40 }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </header>

            <main>
                {step === 'welcome' && <Welcome onStart={handleStart} hasSavedBrand={hasSavedBrand} onGoToContent={handleGoToContent} />}
                {step === 'config' && (
                    <BrandConfigForm
                        initialData={brandConfig}
                        onSave={handleSaveConfig}
                        onCancel={() => setStep('welcome')}
                    />
                )}
                {step === 'create' && (
                    <ContentRequestForm
                        onGenerate={handleGenerate}
                        brandName={brandConfig.brandName}
                        logoBase64={brandConfig.logoBase64}
                        onEditBrand={handleEditConfig}
                    />
                )}
                {step === 'result' && lastResult && (
                    <ResultPanel
                        result={lastResult}
                        onBack={() => setStep('create')}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
