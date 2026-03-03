"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onReferenceHandler = onReferenceHandler;
const LSP = __importStar(require("vscode-languageserver/node"));
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const analyzer_1 = require("../tree-sitter/analyzer");
function onReferenceHandler(referenceParams) {
    const { textDocument: { uri }, position, context: { includeDeclaration } } = referenceParams;
    OutputLogger_1.logger.debug(`[onReference] includeDeclaration: ${includeDeclaration}`);
    OutputLogger_1.logger.debug(`[onReference] Position: Line ${position.line} Character ${position.character}`);
    const wordPosition = {
        line: position.line,
        character: Math.max(position.character - 1, 0)
    };
    const word = analyzer_1.analyzer.wordAtPointFromTextPosition({
        ...referenceParams,
        position: wordPosition
    });
    const references = [];
    if (word !== null) {
        const symbolAtPoint = analyzer_1.analyzer.findExactSymbolAtPoint(uri, position, word);
        if (symbolAtPoint?.kind === LSP.SymbolKind.Variable || symbolAtPoint?.kind === LSP.SymbolKind.Function) {
            const allReferenceSymbols = [
                ...analyzer_1.analyzer.getAllSymbols(uri)
            ];
            analyzer_1.analyzer.getIncludeUrisForUri(uri).forEach((includeUri) => {
                allReferenceSymbols.push(...analyzer_1.analyzer.getAllSymbols(includeUri));
            });
            allReferenceSymbols.filter(symbol => symbol.name === word && symbol.kind === symbolAtPoint?.kind).forEach((symbol) => {
                references.push({
                    uri: symbol.location.uri,
                    range: symbol.location.range
                });
            });
            return references;
        }
    }
    return null;
}
//# sourceMappingURL=onReference.js.map