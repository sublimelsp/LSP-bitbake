import type Parser from 'web-tree-sitter';
import { type EmbeddedLanguageDoc } from '../lib/src/types/embedded-languages';
import { type TextDocument } from 'vscode-languageserver-textdocument';
export declare const imports: string[];
export declare const generatePythonEmbeddedLanguageDoc: (textDocument: TextDocument, bitBakeTree: Parser.Tree) => EmbeddedLanguageDoc;
export declare const getPythonHeader: (originalUri: string) => string;
