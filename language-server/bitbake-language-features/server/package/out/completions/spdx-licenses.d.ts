import { type CompletionItem } from 'vscode-languageserver/node';
import { type Position, type TextDocument } from 'vscode-languageserver-textdocument';
export declare const spdxLicenseDescription = "Source: SPDX License List";
export declare const licenseOperators: CompletionItem[];
export declare const getLicenseCompletionItems: (textDocument: TextDocument, position: Position) => Promise<CompletionItem[]>;
export declare const getSpdxLicenseCompletionResolve: (item: CompletionItem) => Promise<CompletionItem>;
