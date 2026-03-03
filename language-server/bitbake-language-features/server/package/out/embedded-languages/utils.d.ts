import { type TextDocument } from 'vscode-languageserver-textdocument';
import { type EmbeddedLanguageDoc, type EmbeddedLanguageType } from '../lib/src/types/embedded-languages';
export declare const initEmbeddedLanguageDoc: (textDocument: TextDocument, language: EmbeddedLanguageType) => EmbeddedLanguageDoc;
export declare const insertTextIntoEmbeddedLanguageDoc: (embeddedLanguageDoc: EmbeddedLanguageDoc, start: number, end: number, textToInsert: string) => void;
