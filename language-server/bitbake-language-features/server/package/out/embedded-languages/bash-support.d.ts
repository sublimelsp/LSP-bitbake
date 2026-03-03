import { type EmbeddedLanguageDoc } from '../lib/src/types/embedded-languages';
import type Parser from 'web-tree-sitter';
import { type TextDocument } from 'vscode-languageserver-textdocument';
export declare const generateBashEmbeddedLanguageDoc: (textDocument: TextDocument, bitBakeTree: Parser.Tree, shouldKeepExactPositions: boolean, pokyFolder?: string) => EmbeddedLanguageDoc;
export declare const getBashHeader: (originalUri: string) => string;
