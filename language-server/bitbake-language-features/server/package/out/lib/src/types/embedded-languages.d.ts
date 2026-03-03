export type EmbeddedLanguageType = 'bash' | 'python';
export interface EmbeddedLanguageDoc {
    originalUri: string;
    language: EmbeddedLanguageType;
    content: string;
    characterIndexes: number[];
}
