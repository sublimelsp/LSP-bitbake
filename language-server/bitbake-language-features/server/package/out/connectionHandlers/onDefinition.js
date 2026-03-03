"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefinitionsConnection = setDefinitionsConnection;
exports.onDefinitionHandler = onDefinitionHandler;
exports.getAllDefinitionSymbolsForSymbolAtPoint = getAllDefinitionSymbolsForSymbolAtPoint;
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const node_1 = require("vscode-languageserver/node");
const analyzer_1 = require("../tree-sitter/analyzer");
const BitbakeProjectScannerClient_1 = require("../BitbakeProjectScannerClient");
let connection;
function setDefinitionsConnection(conn) {
    connection = conn;
}
async function onDefinitionHandler(textDocumentPositionParams) {
    const { textDocument: { uri }, position } = textDocumentPositionParams;
    const wordPosition = {
        line: position.line,
        character: Math.max(position.character - 1, 0)
    };
    const word = analyzer_1.analyzer.wordAtPointFromTextPosition({
        ...textDocumentPositionParams,
        position: wordPosition
    });
    const documentAsText = analyzer_1.analyzer.getDocumentTexts(uri);
    if (documentAsText === undefined) {
        OutputLogger_1.logger.debug(`[onDefinition] Document not found for ${uri}`);
        return [];
    }
    const lastScanResult = analyzer_1.analyzer.getLastScanResult(uri);
    const definitions = [];
    // require, inherit & include directives
    const directiveStatementKeyword = analyzer_1.analyzer.getDirectiveStatementKeywordByNodeType(textDocumentPositionParams);
    const directivePath = analyzer_1.analyzer.getDirectivePathForPosition(textDocumentPositionParams);
    if (directiveStatementKeyword !== undefined && directivePath !== undefined) {
        OutputLogger_1.logger.debug(`[onDefinition] Found directive: ${directiveStatementKeyword}`);
        let resolvedDirectivePath = directivePath;
        if (lastScanResult !== undefined) {
            resolvedDirectivePath = analyzer_1.analyzer.resolveSymbol(directivePath, lastScanResult.symbols);
        }
        definitions.push(...getDefinitionForDirectives(directiveStatementKeyword, resolvedDirectivePath));
        OutputLogger_1.logger.debug(`[onDefinition] definition item: ${JSON.stringify(definitions)}`);
        return definitions;
    }
    if (word !== null) {
        const symbolAtPoint = analyzer_1.analyzer.findExactSymbolAtPoint(uri, position, word);
        if (symbolAtPoint?.kind === node_1.SymbolKind.Variable || symbolAtPoint?.kind === node_1.SymbolKind.Function) {
            getAllDefinitionSymbolsForSymbolAtPoint(uri, word, symbolAtPoint).forEach((symbol) => {
                definitions.push({
                    uri: symbol.location.uri,
                    range: symbol.location.range
                });
            });
            if (lastScanResult !== undefined && symbolAtPoint !== undefined) {
                const foundSymbol = analyzer_1.analyzer.matchSymbol(symbolAtPoint, lastScanResult.symbols);
                if (foundSymbol !== undefined) {
                    const modificationHistory = analyzer_1.analyzer.extractModificationHistoryFromComments(foundSymbol);
                    for (const location of modificationHistory) {
                        const resolvedLocation = await connection?.sendRequest('bitbake/resolveContainerPath', location.uri.replace('file://', ''));
                        definitions.push({
                            uri: resolvedLocation ?? location.uri,
                            range: location.range
                        });
                    }
                }
            }
            return definitions;
        }
        // Symbols in string content
        if (analyzer_1.analyzer.isStringContent(uri, position.line, position.character)) {
            const allSymbolsAtPosition = analyzer_1.analyzer.getSymbolsInStringContent(uri, position.line, position.character);
            allSymbolsAtPosition.forEach((symbol) => {
                definitions.push({
                    uri: symbol.location.uri,
                    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
                });
            });
            return definitions;
        }
        // Overrides
        if (analyzer_1.analyzer.isOverride(uri, position.line, position.character)) {
            if (lastScanResult !== undefined) {
                const targetPath = lastScanResult.includeHistory.find((includePath) => {
                    return includePath.ext === '.conf' && includePath.name === word;
                });
                if (targetPath !== undefined) {
                    definitions.push(createDefinitionLocationForPathInfo(targetPath));
                    return definitions;
                }
            }
            const overrideFile = BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._confFiles.find((confFile) => {
                return confFile.name === word;
            });
            if (overrideFile?.path !== undefined) {
                definitions.push(createDefinitionLocationForPathInfo(overrideFile.path));
                return definitions;
            }
        }
    }
    return [];
}
function getDefinitionForDirectives(directiveStatementKeyword, directivePath) {
    let elementInfos = [];
    switch (directiveStatementKeyword) {
        case 'inherit':
        case 'inherit_defer':
            elementInfos = BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.bitbakeScanResult._classes.filter((bbclass) => {
                return bbclass.name === directivePath;
            });
            break;
        case 'require':
        case 'include':
            elementInfos = analyzer_1.analyzer.findFilesInProjectScanner(directivePath);
            break;
        default:
            return [];
    }
    const definition = [];
    for (const elementInfo of elementInfos) {
        if (elementInfo.path !== undefined) {
            const location = createDefinitionLocationForPathInfo(elementInfo.path);
            definition.push(location);
        }
    }
    return definition;
}
function createDefinitionLocationForPathInfo(path) {
    const url = 'file://' + path.dir + '/' + path.base;
    const location = node_1.Location.create(encodeURI(url), node_1.Range.create(0, 0, 0, 0));
    return location;
}
function getAllDefinitionSymbolsForSymbolAtPoint(uri, word, symbolAtPoint) {
    if (symbolAtPoint === undefined) {
        return [];
    }
    const allDeclarationSymbols = [
        ...analyzer_1.analyzer.getGlobalDeclarationSymbols(uri)
    ];
    analyzer_1.analyzer.getIncludeUrisForUri(uri)?.forEach((includeFileUri) => {
        allDeclarationSymbols.push(...analyzer_1.analyzer.getGlobalDeclarationSymbols(includeFileUri));
    });
    return allDeclarationSymbols.filter(symbol => symbol.name === word && symbol.kind === symbolAtPoint?.kind);
}
//# sourceMappingURL=onDefinition.js.map