import { type TextDocument } from 'vscode-languageserver-textdocument';
import { type Position } from 'vscode-languageserver';
import { type EmbeddedLanguageDoc, type EmbeddedLanguageType } from '../lib/src/types/embedded-languages';
export declare const generateEmbeddedLanguageDocs: (textDocument: TextDocument, pokyFolder?: string) => EmbeddedLanguageDoc[] | undefined;
export declare const getEmbeddedLanguageTypeOnPosition: (uriString: string, position: Position) => EmbeddedLanguageType | undefined;
