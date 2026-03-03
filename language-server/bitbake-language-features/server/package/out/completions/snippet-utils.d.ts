/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/snippets.ts#L659
 */
import { type CompletionItem, CompletionItemKind } from 'vscode-languageserver';
export declare function formatCompletionItems(completions: CompletionItem[], completionItemKind?: CompletionItemKind): CompletionItem[];
