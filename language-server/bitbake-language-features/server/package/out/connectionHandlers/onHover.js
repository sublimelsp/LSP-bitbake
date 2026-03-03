"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onHoverHandler = onHoverHandler;
const analyzer_1 = require("../tree-sitter/analyzer");
const BitBakeDocScanner_1 = require("../BitBakeDocScanner");
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const directiveKeywords_1 = require("../lib/src/types/directiveKeywords");
const path_1 = __importDefault(require("path"));
const spdx_licenses_1 = require("../utils/spdx-licenses");
const textDocument_1 = require("../utils/textDocument");
async function onHoverHandler(params) {
    const { position, textDocument } = params;
    OutputLogger_1.logger.debug(`[onHover] document uri: ${textDocument.uri} position: Line ${position.line} Column ${position.character}`);
    const word = analyzer_1.analyzer.wordAtPoint(textDocument.uri, position.line, position.character);
    if (word === null) {
        return null;
    }
    let hoverValue = '';
    const hoverKind = 'markdown';
    // Find the exact variable at the position
    const exactSymbol = analyzer_1.analyzer.findExactSymbolAtPoint(textDocument.uri, position, word);
    // Show documentation of a bitbake variable
    // Triggers on global declaration expressions like "VAR = 'foo'" and inside variable expansion like "FOO = ${VAR}" but skip the ones like "python VAR(){}"
    const bitbakeNode = analyzer_1.analyzer.bitBakeNodeAtPoint(textDocument.uri, position.line, position.character);
    const canShowHoverDefinitionForVariableName = (analyzer_1.analyzer.getGlobalDeclarationSymbols(textDocument.uri).some((symbol) => symbol.name === word) && analyzer_1.analyzer.isIdentifierOfVariableAssignment(params)) || analyzer_1.analyzer.isBitBakeVariableExpansion(textDocument.uri, position.line, position.character) || (bitbakeNode !== null && analyzer_1.analyzer.isPythonDatastoreVariable(bitbakeNode)) || analyzer_1.analyzer.isBashVariableName(textDocument.uri, position.line, position.character);
    if (canShowHoverDefinitionForVariableName) {
        const found = [
            ...BitBakeDocScanner_1.bitBakeDocScanner.bitbakeVariableInfo.filter((bitbakeVariable) => !BitBakeDocScanner_1.bitBakeDocScanner.yoctoVariableInfo.some(yoctoVariable => yoctoVariable.name === bitbakeVariable.name)),
            ...BitBakeDocScanner_1.bitBakeDocScanner.yoctoVariableInfo
        ].find((item) => item.name === word);
        if (found !== undefined) {
            OutputLogger_1.logger.debug(`[onHover] Found bitbake variable: ${word}`);
            const range = analyzer_1.analyzer.rangeForWordAtPoint(params);
            if (range === undefined) {
                OutputLogger_1.logger.debug(`[onHover] Can't find the range for word: ${word}`);
                return null;
            }
            const start = range.start.character;
            const end = range.end.character;
            if ((start > position.character) || (end <= position.character)) {
                OutputLogger_1.logger.debug(`[onHover] Invalid position: Line: ${position.line} Character: ${position.character}`);
                return null;
            }
            hoverValue = `**${found.name}**\n___\n${found.definition}`;
        }
        const lastScanResult = analyzer_1.analyzer.getLastScanResult(textDocument.uri);
        if (lastScanResult !== undefined && exactSymbol !== undefined) {
            const resolvedSymbol = analyzer_1.analyzer.resolveSymbol(exactSymbol, lastScanResult.symbols);
            const foundSymbol = analyzer_1.analyzer.matchSymbol(resolvedSymbol, lastScanResult.symbols);
            if (foundSymbol?.finalValue !== undefined) {
                if (hoverValue.split('\n___\n').length === 2) { // when the variable has a definition obtained from above
                    const splitted = hoverValue.split('\n___\n');
                    splitted.splice(1, 0, `**Final Value**\n___\n\t'${foundSymbol.finalValue}'`); // Alternative: use the array method toSpliced() for node.js >= 20.0.0
                    hoverValue = splitted.join('\n___\n');
                }
                else {
                    hoverValue += `**Final Value**\n___\n\t'${foundSymbol.finalValue}'`;
                }
            }
        }
    }
    // Variable flag
    if (analyzer_1.analyzer.isVariableFlag(params)) {
        const found = BitBakeDocScanner_1.bitBakeDocScanner.variableFlagInfo.find(item => item.name === word);
        if (found !== undefined) {
            OutputLogger_1.logger.debug(`[onHover] Found variable flag: ${found.name}`);
            hoverValue = `**${found.name}**\n___\n${found.definition}`;
        }
    }
    // Yocto tasks
    if (analyzer_1.analyzer.isFunctionIdentifier(params)) {
        const found = BitBakeDocScanner_1.bitBakeDocScanner.yoctoTaskInfo.find(item => item.name === word);
        if (found !== undefined) {
            OutputLogger_1.logger.debug(`[onHover] Found Yocto task: ${found.name}`);
            hoverValue = `**${found.name}**\n___\n${found.definition}`;
        }
    }
    // Keywords
    const keyword = analyzer_1.analyzer.getKeywordForPosition(textDocument.uri, position.line, position.character);
    if (keyword !== undefined && directiveKeywords_1.DIRECTIVE_STATEMENT_KEYWORDS.includes(word)) {
        const keywordInfo = BitBakeDocScanner_1.bitBakeDocScanner.keywordInfo.find(item => item.name === word);
        if (keywordInfo !== undefined) {
            hoverValue = `**${keywordInfo.name}**\n___\n${keywordInfo.definition}`;
        }
    }
    let comments = null;
    if (exactSymbol !== undefined) {
        comments = getGlobalSymbolComments(textDocument.uri, word);
    }
    // License
    const variablesAllowedForLicenseCompletion = ['LICENSE'];
    const isVariableAllowedForLicenseCompletion = analyzer_1.analyzer.isStringContentOfVariableAssignment(textDocument.uri, position.line, position.character, variablesAllowedForLicenseCompletion);
    if (isVariableAllowedForLicenseCompletion) {
        const document = analyzer_1.analyzer.getAnalyzedDocument(textDocument.uri)?.document;
        if (document !== undefined) {
            const range = (0, textDocument_1.getRangeOfWord)(document, position);
            const licenseId = document.getText(range);
            const spdxLicense = await (0, spdx_licenses_1.getSpdxLicense)(licenseId);
            if (spdxLicense !== undefined) {
                const spdxLicenseDetails = await (0, spdx_licenses_1.getSpdxLicenseDetails)(spdxLicense);
                const depractionMessage = spdxLicenseDetails.isDeprecatedLicenseId ? '(deprecated)' : '';
                return {
                    contents: {
                        kind: hoverKind,
                        value: [
                            `**${spdxLicenseDetails.name}** ${depractionMessage}`,
                            '___',
                            `\`\`\`${spdxLicenseDetails.licenseText}\`\`\``
                        ].join('\n')
                    }
                };
            }
        }
    }
    // Append comments for symbols that don't already have documentation from Yocto/BitBake
    if (hoverValue === '' && comments !== null) {
        hoverValue += comments ?? '';
    }
    if (hoverValue !== '') {
        const hover = {
            contents: {
                kind: hoverKind,
                value: hoverValue
            }
        };
        OutputLogger_1.logger.debug(`[onHover] Hover item: ${JSON.stringify(hover)}`);
        return hover;
    }
    return null;
}
function getGlobalSymbolComments(uri, word) {
    const localSymbolsWithComments = analyzer_1.analyzer.getGlobalDeclarationSymbols(uri).filter((symbol) => symbol.name === word).filter((symbol) => symbol.commentsAbove.length > 0);
    const externalSymbolsWithComments = [];
    analyzer_1.analyzer.getIncludeUrisForUri(uri).forEach((includeFileUri) => {
        externalSymbolsWithComments.push(...analyzer_1.analyzer.getGlobalDeclarationSymbols(includeFileUri).filter((symbol) => symbol.name === word).filter((symbol) => symbol.commentsAbove.length > 0));
    });
    const priority = ['.bbclass', '.conf', '.inc', '.bb', '.bbappend'];
    const allSymbolsWithCommentsFoundWithWord = [...localSymbolsWithComments, ...externalSymbolsWithComments];
    let finalComments = '';
    // higher priority comments replace lower ones
    priority.reverse().forEach((ext) => {
        const symbolsForTheExt = allSymbolsWithCommentsFoundWithWord.filter((symbol) => path_1.default.parse(symbol.location.uri).ext === ext);
        if (symbolsForTheExt.length > 0) {
            // Only show comments from one of the symbols to not flood the hover definition with comments
            const symbol = symbolsForTheExt[0];
            finalComments = `${symbol.commentsAbove.map((comment) => comment.slice(1)).join('\n')}` + `\n\nSource: ${symbol.location.uri.replace('file://', '')} \`L: ${symbol.location.range.start.line + 1}\``;
        }
    });
    return finalComments;
}
//# sourceMappingURL=onHover.js.map