import { type Position, type Range, type TextDocument } from 'vscode-languageserver-textdocument';
export declare const getLine: (document: TextDocument, lineNumber: number) => string;
export declare const getPreviousCharactersOnLine: (document: TextDocument, position: Position) => string;
export declare const getRangeOfWord: (document: TextDocument, position: Position, boundRegex?: RegExp) => Range;
