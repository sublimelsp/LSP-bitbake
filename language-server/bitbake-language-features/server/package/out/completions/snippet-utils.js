"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCompletionItems = formatCompletionItems;
/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/snippets.ts#L659
 */
const vscode_languageserver_1 = require("vscode-languageserver");
function formatCompletionItems(completions, completionItemKind) {
    return completions.map((item) => {
        const formatted = {
            ...item,
            insertTextFormat: item.insertText !== undefined ? vscode_languageserver_1.InsertTextFormat.Snippet : vscode_languageserver_1.InsertTextFormat.PlainText,
            documentation: {
                value: [
                    markdownBlock(`${item.label} (bitbake-language-server)\n\n`, 'man'),
                    markdownBlock(item.insertText?.replace(/\$\{\d+:(?<code>.*)\}/g, (m, p1) => p1), 'bitbake'),
                    '---',
                    `${JSON.parse(JSON.stringify(item?.documentation ?? ''))}`,
                    item?.data?.referenceUrl !== undefined ? `[Reference](${item?.data?.referenceUrl})` : ''
                ].join('\n'),
                kind: vscode_languageserver_1.MarkupKind.Markdown
            },
            kind: item.kind ?? completionItemKind ?? vscode_languageserver_1.CompletionItemKind.Snippet
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, ...filtered } = formatted;
        return filtered;
    });
}
function markdownBlock(text, language) {
    const tripleQuote = '```';
    return [tripleQuote + language, text, tripleQuote].join('\n');
}
//# sourceMappingURL=snippet-utils.js.map