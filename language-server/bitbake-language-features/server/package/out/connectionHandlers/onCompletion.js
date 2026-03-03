"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCompletionHandler = onCompletionHandler;
exports.onCompletionResolveHandler = onCompletionResolveHandler;
/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/server.ts#L408
 */
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const node_1 = require("vscode-languageserver/node");
const lsp_1 = require("../utils/lsp");
const bitbake_variables_1 = require("../completions/bitbake-variables");
const reserved_keywords_1 = require("../completions/reserved-keywords");
const analyzer_1 = require("../tree-sitter/analyzer");
const snippet_utils_1 = require("../completions/snippet-utils");
const BitBakeDocScanner_1 = require("../BitBakeDocScanner");
const bitbake_operator_1 = require("../completions/bitbake-operator");
const variable_flags_1 = require("../completions/variable-flags");
const BitbakeProjectScannerClient_1 = require("../BitbakeProjectScannerClient");
const path_1 = __importDefault(require("path"));
const availableVariables_1 = require("../lib/src/availableVariables");
const arrays_1 = require("../lib/src/utils/arrays");
const spdx_licenses_1 = require("../completions/spdx-licenses");
let documentUri = '';
async function onCompletionHandler(textDocumentPositionParams) {
    const wordPosition = {
        line: textDocumentPositionParams.position.line,
        // Go one character back to get completion on the current word.
        character: Math.max(textDocumentPositionParams.position.character - 1, 0)
    };
    documentUri = textDocumentPositionParams.textDocument.uri;
    const word = analyzer_1.analyzer.wordAtPointFromTextPosition({
        ...textDocumentPositionParams,
        position: wordPosition
    });
    OutputLogger_1.logger.debug(`[onCompletion] current word: ${word}`);
    const bitBakeNode = analyzer_1.analyzer.bitBakeNodeAtPoint(documentUri, wordPosition.line, wordPosition.character);
    if (bitBakeNode !== null && analyzer_1.analyzer.isInsideBashRegion(bitBakeNode)) {
        return getBashCompletionItems(documentUri, word, wordPosition);
    }
    if (bitBakeNode !== null && analyzer_1.analyzer.isInsidePythonRegion(bitBakeNode)) {
        return getPythonCompletionItems(documentUri, word, wordPosition);
    }
    return await getBitBakeCompletionItems(textDocumentPositionParams, word, wordPosition);
}
async function getBitBakeCompletionItems(textDocumentPositionParams, word, wordPosition) {
    if (analyzer_1.analyzer.isString(documentUri, wordPosition.line, wordPosition.character)) {
        const variablesAllowedForRecipeCompletion = ['RDEPENDS', 'IMAGE_INSTALL', 'DEPENDS', 'RRECOMMENDS', 'RSUGGESTS', 'RCONFLICTS', 'RREPLACES', 'CORE_IMAGE_EXTRA_INSTALL', 'PACKAGE_INSTALL', 'PACKAGE_INSTALL_ATTEMPTONLY'];
        const isVariableAllowedForRecipeCompletion = analyzer_1.analyzer.isStringContentOfVariableAssignment(documentUri, wordPosition.line, wordPosition.character, variablesAllowedForRecipeCompletion);
        if (isVariableAllowedForRecipeCompletion) {
            return convertElementInfoListToCompletionItemList(BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._recipes, node_1.CompletionItemKind.Interface, 'bb', true);
        }
        const variablesAllowedForUriCompletion = ['SRC_URI'];
        const isVariableAllowedForUriCompletion = analyzer_1.analyzer.isStringContentOfVariableAssignment(documentUri, wordPosition.line, wordPosition.character, variablesAllowedForUriCompletion);
        const recipeLocalFiles = analyzer_1.analyzer.getRecipeLocalFiles(documentUri);
        if (isVariableAllowedForUriCompletion && recipeLocalFiles !== undefined) {
            const fileUriCompletionItems = recipeLocalFiles.foundFileUris.map((fileUri) => {
                return {
                    label: path_1.default.basename(fileUri),
                    kind: node_1.CompletionItemKind.File,
                    detail: fileUri,
                    insertText: `file://${path_1.default.basename(fileUri)}`
                };
            });
            const dirCompletionItems = recipeLocalFiles.foundDirs.map((dir) => {
                return {
                    label: path_1.default.basename(dir),
                    kind: node_1.CompletionItemKind.Folder,
                    insertText: `file://${path_1.default.basename(dir)}/`
                };
            });
            return [
                ...fileUriCompletionItems,
                ...dirCompletionItems
            ];
        }
        const variablesAllowedForLicenseCompletion = ['LICENSE'];
        const isVariableAllowedForLicenseCompletion = analyzer_1.analyzer.isStringContentOfVariableAssignment(documentUri, wordPosition.line, wordPosition.character, variablesAllowedForLicenseCompletion);
        if (isVariableAllowedForLicenseCompletion && recipeLocalFiles !== undefined && word !== null) {
            const textDocument = analyzer_1.analyzer.getAnalyzedDocument(documentUri)?.document;
            if (textDocument !== undefined) {
                return await (0, spdx_licenses_1.getLicenseCompletionItems)(textDocument, textDocumentPositionParams.position);
            }
        }
        return [];
    }
    // bitbake operators
    const isOverride = analyzer_1.analyzer.isOverride(documentUri, wordPosition.line, wordPosition.character);
    if (word === ':' || isOverride) {
        const wordBeforeIsIdentifier = analyzer_1.analyzer.isIdentifier({
            ...textDocumentPositionParams,
            position: {
                line: textDocumentPositionParams.position.line,
                // Go two character back as one character back is ':'
                character: Math.max(textDocumentPositionParams.position.character - 2, 0)
            }
        });
        if (wordBeforeIsIdentifier || isOverride) {
            const bitBakeOperatorCompletionItems = bitbake_operator_1.BITBAKE_OPERATOR.map(keyword => {
                return {
                    label: keyword,
                    kind: node_1.CompletionItemKind.Operator
                };
            });
            const bitbakeOverridesCompletionItems = BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._overrides.map((override, index) => {
                let label = override;
                if (override === 'pn-defaultpkgname') {
                    label = '${PN}';
                }
                return {
                    label,
                    kind: node_1.CompletionItemKind.Property,
                    // Present overrides after operators, in order of priority
                    sortText: '~' + String.fromCharCode(21 + index) + label
                };
            });
            return [...bitBakeOperatorCompletionItems, ...bitbakeOverridesCompletionItems];
        }
        else {
            return [];
        }
    }
    // variable flags
    if (word === '[') {
        const wordBeforeIsIdentifier = analyzer_1.analyzer.isIdentifier({
            ...textDocumentPositionParams,
            position: {
                line: textDocumentPositionParams.position.line,
                // Go two character back as one character back is ':'
                character: Math.max(textDocumentPositionParams.position.character - 2, 0)
            }
        });
        if (wordBeforeIsIdentifier) {
            const variableFlagsFromScanner = (0, snippet_utils_1.formatCompletionItems)(docInfoToCompletionItems(BitBakeDocScanner_1.bitBakeDocScanner.variableFlagInfo), node_1.CompletionItemKind.Keyword);
            const variableFlagCompletionItems = variable_flags_1.VARIABLE_FLAGS.map(keyword => {
                return {
                    label: keyword,
                    kind: node_1.CompletionItemKind.Keyword
                };
            });
            return variableFlagsFromScanner.length > 0 ? variableFlagsFromScanner : variableFlagCompletionItems;
        }
        else {
            return [];
        }
    }
    const symbolCompletionItems = getSymbolCompletionItems(word);
    // Directive statements completion items. bbclass files, include files, recipe files etc
    const directiveStatementKeyword = analyzer_1.analyzer.getDirectiveStatementKeywordByLine(textDocumentPositionParams);
    if (directiveStatementKeyword !== undefined) {
        OutputLogger_1.logger.debug(`[onCompletion] Found directive statement: ${directiveStatementKeyword}`);
        return getCompletionItemForDirectiveStatementKeyword(directiveStatementKeyword);
    }
    const isBitBakeVariableExpansion = analyzer_1.analyzer.isBitBakeVariableExpansion(documentUri, wordPosition.line, wordPosition.character);
    const commonDirectoriesCompletionItems = isBitBakeVariableExpansion ? allCommonDirectoriesCompletionItems : [];
    const reservedKeywordCompletionItems = !isBitBakeVariableExpansion ? allReserverdKeywordCompletionItems : [];
    return (0, arrays_1.mergeArraysDistinctly)((completionItem) => completionItem.label, 
    // In priority order
    getSymbolCompletionItems(word), reservedKeywordCompletionItems, getVariablecompletionItems(symbolCompletionItems), getYoctoTaskSnippets(), commonDirectoriesCompletionItems);
}
function getBashCompletionItems(documentUri, word, wordPosition) {
    if (analyzer_1.analyzer.isBashVariableName(documentUri, wordPosition.line, wordPosition.character)) {
        const symbolCompletionItems = getSymbolCompletionItems(word);
        return (0, arrays_1.mergeArraysDistinctly)((completionItem) => completionItem.label, getVariablecompletionItems(symbolCompletionItems), symbolCompletionItems, allCommonDirectoriesCompletionItems);
    }
    return getYoctoTaskSnippets();
}
function getPythonCompletionItems(documentUri, word, wordPosition) {
    const bitbakeNode = analyzer_1.analyzer.bitBakeNodeAtPoint(documentUri, wordPosition.line, wordPosition.character);
    if (bitbakeNode !== null && analyzer_1.analyzer.isPythonDatastoreVariable(bitbakeNode, true)) {
        const symbolCompletionItems = getSymbolCompletionItems(word);
        return (0, arrays_1.mergeArraysDistinctly)((completionItem) => completionItem.label, getVariablecompletionItems(symbolCompletionItems), symbolCompletionItems, allCommonDirectoriesCompletionItems);
    }
    if (analyzer_1.analyzer.isString(documentUri, wordPosition.line, wordPosition.character)) {
        return [];
    }
    return getYoctoTaskSnippets();
}
function getYoctoTaskSnippets() {
    return (0, snippet_utils_1.formatCompletionItems)(docInfoToCompletionItems(BitBakeDocScanner_1.bitBakeDocScanner.yoctoTaskInfo), node_1.CompletionItemKind.Snippet);
}
const allReserverdKeywordCompletionItems = reserved_keywords_1.RESERVED_KEYWORDS.map(keyword => {
    return {
        label: keyword,
        kind: node_1.CompletionItemKind.Keyword
    };
});
const allCommonDirectoriesCompletionItems = Array.from(availableVariables_1.commonDirectoriesVariables).map((variable) => {
    return {
        label: variable,
        kind: node_1.CompletionItemKind.Variable
    };
});
function getSymbolCompletionItems(word) {
    if (word !== null) {
        const uniqueSymbolSet = new Set();
        const globalDeclarationSymbols = analyzer_1.analyzer.getGlobalDeclarationSymbols(documentUri).filter(symbol => {
            if (!uniqueSymbolSet.has(symbol.name)) {
                uniqueSymbolSet.add(symbol.name);
                return true;
            }
            return false;
        });
        // Filter out duplicate BITBAKE_VARIABLES as they will be included as global declaration after running analyzer.analyze() in documents.onDidChangeContent() in server.ts
        return [
            ...globalDeclarationSymbols.filter((symbol) => !(new Set(bitbake_variables_1.BITBAKE_VARIABLES).has(symbol.name))).map((symbol) => ({
                label: symbol.name,
                kind: (0, lsp_1.symbolKindToCompletionKind)(symbol.kind),
                documentation: `${symbol.name}`
            })),
            ...(0, snippet_utils_1.formatCompletionItems)(convertExtraSymbolsToCompletionItems(documentUri))
        ];
    }
    return [];
}
function getBitBakeVariableCompletionItems() {
    return BitBakeDocScanner_1.bitBakeDocScanner.bitbakeVariableInfo.length > 0
        ? (0, snippet_utils_1.formatCompletionItems)(docInfoToCompletionItems(BitBakeDocScanner_1.bitBakeDocScanner.bitbakeVariableInfo), node_1.CompletionItemKind.Variable)
        : bitbake_variables_1.BITBAKE_VARIABLES.map(keyword => {
            return {
                label: keyword,
                kind: node_1.CompletionItemKind.Variable
            };
        });
}
function getYoctoVariableCompletionItems() {
    return (0, snippet_utils_1.formatCompletionItems)(docInfoToCompletionItems(BitBakeDocScanner_1.bitBakeDocScanner.yoctoVariableInfo), node_1.CompletionItemKind.Variable);
}
function getVariablecompletionItems(symbolCompletionItems = []) {
    const yoctoVariableCompletionItems = getYoctoVariableCompletionItems();
    // 1. Remove the duplicate variables by their names. It still keeps the fallback variables from BITBAKE_VARIABLES before scanning the docs since yoctoVariableCompletionItems will be [] in that case
    // 2. Remove the duplicates in variable completion items if they exist in the extra symbols. Keep the ones in the extra symbols as they contain information about the relative path.
    return [...getBitBakeVariableCompletionItems().filter((bitbakeVariable) => !yoctoVariableCompletionItems.some(yoctoVariable => yoctoVariable.label === bitbakeVariable.label)),
        ...yoctoVariableCompletionItems
    ].filter((variableCompletionItem) => !symbolCompletionItems.some((symbolCompletionItem) => symbolCompletionItem.label === variableCompletionItem.label));
}
/**
 * Convert data in BitBakeDocScanner to completion items
 */
function docInfoToCompletionItems(docInfo) {
    const completionItems = [];
    docInfo.forEach((info) => {
        completionItems.push({
            label: info.name,
            labelDetails: {
                description: info.docSource !== undefined ? `Source: ${info.docSource}` : ''
            },
            documentation: info.definition,
            data: {
                referenceUrl: info.referenceUrl
            },
            insertText: info?.insertText
        });
    });
    return completionItems;
}
function getCompletionItemForDirectiveStatementKeyword(keyword) {
    let completionItem = [];
    switch (keyword) {
        case 'inherit':
        case 'inherit_defer':
            completionItem = [
                ...convertElementInfoListToCompletionItemList(BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._classes, node_1.CompletionItemKind.Class, 'bbclass')
            ];
            break;
        case 'require':
        case 'include':
            completionItem = [
                ...convertElementInfoListToCompletionItemList(BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._includes, node_1.CompletionItemKind.Interface, 'inc'),
                ...convertElementInfoListToCompletionItemList(BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._recipes, node_1.CompletionItemKind.Interface, 'bb')
            ];
            break;
        default:
            break;
    }
    return completionItem;
}
function convertElementInfoListToCompletionItemList(elementInfoList, completionItemKind, fileType, nameOnly = false) {
    const completionItems = [];
    for (const element of elementInfoList) {
        const filePath = getFilePath(element, fileType);
        const base = element.name + '.' + fileType;
        const completionItem = {
            label: (nameOnly || fileType === 'bbclass') ? element.name : base,
            detail: base,
            labelDetails: {
                description: filePath ?? fileType
            },
            insertText: nameOnly ? element.name : filePath ?? element.name,
            documentation: element.extraInfo,
            data: element,
            kind: completionItemKind
        };
        completionItems.push(completionItem);
    }
    if (completionItems.length > 0) {
        const docUriSplit = documentUri.replace('file://', '').split('/');
        const condition = (item) => {
            if (item.insertText === undefined || item.insertText.split('.')[0] === item.label.split('.')[0]) {
                return false;
            }
            else {
                return docUriSplit.includes(item.insertText.split('/')[0]);
            }
        };
        completionItems.sort((a, b) => Number(condition(b)) - Number(condition(a)));
    }
    return completionItems;
}
function getFilePath(elementInfo, fileType) {
    if (fileType === 'inc' || fileType === 'bb') {
        const path = elementInfo.path;
        if (path === undefined) {
            return undefined;
        }
        let pathAsString = path.dir.replace(elementInfo.layerInfo?.path ?? '', '');
        if (pathAsString.startsWith('/')) {
            pathAsString = pathAsString.slice(1);
        }
        return pathAsString + '/' + path.base;
    }
    return undefined;
}
function convertExtraSymbolsToCompletionItems(uri) {
    OutputLogger_1.logger.debug(`[onCompletion] convertSymbolsToCompletionItems: ${uri}`);
    let completionItems = [];
    analyzer_1.analyzer.getIncludeUrisForUri(uri).map((includeUri) => {
        return analyzer_1.analyzer.getGlobalDeclarationSymbols(includeUri);
    })
        .flat()
        .reduce((acc, symbol) => {
        if (acc.find((s) => s.name === symbol.name) === undefined) { // Symbols with the same name are considered duplicates, regardless of overrides, because we only need one for each as a completion item
            acc.push(symbol);
        }
        return acc;
    }, [])
        .forEach((extraSymbol) => {
        const variableInfo = [
            ...BitBakeDocScanner_1.bitBakeDocScanner.bitbakeVariableInfo.filter((bitbakeVariable) => !BitBakeDocScanner_1.bitBakeDocScanner.yoctoVariableInfo.some(yoctoVariable => yoctoVariable.name === bitbakeVariable.name)),
            ...BitBakeDocScanner_1.bitBakeDocScanner.yoctoVariableInfo
        ];
        const foundInVariableInfo = variableInfo.find((variable) => variable.name === extraSymbol.name);
        const completionItem = {
            label: extraSymbol.name,
            labelDetails: {
                description: path_1.default.relative(documentUri.replace('file://', ''), extraSymbol.location.uri.replace('file://', ''))
            },
            documentation: foundInVariableInfo?.definition ?? '',
            kind: (0, lsp_1.symbolKindToCompletionKind)(extraSymbol.kind),
            data: {
                referenceUrl: foundInVariableInfo?.referenceUrl
            },
            insertText: foundInVariableInfo?.insertText
        };
        completionItems.push(completionItem);
    });
    // Add supplement variables and function completions from the scan results (bitbake -e)
    const lastScanResult = analyzer_1.analyzer.getLastScanResult(documentUri);
    if (lastScanResult !== undefined) {
        const scanResultCompletionItems = lastScanResult.symbols.filter((symbol) => !completionItems.some((item) => item.label === symbol.name)).map((symbol) => {
            const completionItem = {
                label: symbol.name,
                kind: (0, lsp_1.symbolKindToCompletionKind)(symbol.kind),
                documentation: symbol.finalValue ?? ''
            };
            return completionItem;
        });
        completionItems = [
            ...completionItems,
            ...scanResultCompletionItems
        ];
    }
    // Filter duplicates from the included files, current goal is to show only one item for one symbol even though it occurs in multiple included files. The one that remains will still contain the path in its label details but it doesn't necessarily indicate the location of the very first occurance.
    const uniqueItems = new Set();
    completionItems = completionItems.filter(item => {
        if (!uniqueItems.has(item.label)) {
            uniqueItems.add(item.label);
            return true;
        }
        return false;
    });
    return completionItems;
}
async function onCompletionResolveHandler(item) {
    OutputLogger_1.logger.debug(`[onCompletionResolve]: ${JSON.stringify(item)}`);
    // For reason, item.labelDetails disappears once the item is here.
    if (item.data?.source === spdx_licenses_1.spdxLicenseDescription) {
        return await (0, spdx_licenses_1.getSpdxLicenseCompletionResolve)(item);
    }
    return item;
}
//# sourceMappingURL=onCompletion.js.map