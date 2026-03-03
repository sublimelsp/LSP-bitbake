/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/server.ts#L754
 */
import * as LSP from 'vscode-languageserver/node';
export declare function symbolKindToCompletionKind(s: LSP.SymbolKind): LSP.CompletionItemKind;
