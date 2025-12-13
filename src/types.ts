export type Tone = 'professional' | 'friendly' | 'witty' | 'empathetic' | 'authoritative' | 'bold';
export type Goal = 'awareness' | 'conversion' | 'engagement' | 'loyalty';
export type VisualStyle = 'minimalist' | 'colorful' | 'corporate' | 'artistic' | 'futuristic';
export type Format = 'post' | 'reel' | 'story' | 'carousel';
export type Intent = 'informar' | 'vender' | 'invitar' | 'felicitar' | 'entretener';
export type Cta = 'dm' | 'whatsapp' | 'seguir' | 'agendar' | 'descargar';
export type Length = 'short' | 'medium' | 'long';
export type SalesLevel = 'soft' | 'hard' | 'none';
export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';

export interface BrandConfig {
    brandName: string;
    whatIDo: string;
    services: string[];
    audience: string;
    tone: Tone;
    forbiddenWords: string;
    writingStyle: string;

    mainGoal: Goal;
    visualStyle: VisualStyle;
    realismRange: number; // 0-100
    noTextInImages: boolean;

    logoBase64: string | null; // Changed from image to logoBase64 and made essential
}

export interface ContentRequest {
    mode: 'instant' | 'planning';
    platform: Platform;
    format: Format;
    pillar: string;
    keywords: string; // Changed to string for simple input
    eventDate?: string;
    intent: Intent;
    cta: Cta;
    length: Length;
    salesLevel: SalesLevel;
    heroImageBase64: string | null;
}

export interface GeneratedContent {
    prompt_text: string;
    prompt_image: string;
    metadata: any;
    // New fields for the strict JSON output
    finalJson: any;
}

export const initialBrandConfig: BrandConfig = {
    brandName: '',
    whatIDo: '',
    services: ['', '', ''],
    audience: '',
    tone: 'professional',
    forbiddenWords: '',
    writingStyle: '',
    mainGoal: 'awareness',
    visualStyle: 'minimalist',
    realismRange: 50,
    noTextInImages: true,
    logoBase64: null,
};
