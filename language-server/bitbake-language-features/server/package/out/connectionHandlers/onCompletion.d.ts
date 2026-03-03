import { type TextDocumentPositionParams, type CompletionItem } from 'vscode-languageserver/node';
export declare function onCompletionHandler(textDocumentPositionParams: TextDocumentPositionParams): Promise<CompletionItem[]>;
export declare function onCompletionResolveHandler(item: CompletionItem): Promise<CompletionItem>;
