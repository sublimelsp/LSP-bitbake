"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRenameRequestHandler = onRenameRequestHandler;
exports.onPrepareRenameHandler = onPrepareRenameHandler;
const analyzer_1 = require("../tree-sitter/analyzer");
function onRenameRequestHandler(renameParams) {
    const { position, newName, textDocument: { uri } } = renameParams;
    const word = analyzer_1.analyzer.wordAtPoint(uri, position.line, position.character);
    if (word === null) {
        return null;
    }
    const exactSymbol = analyzer_1.analyzer.findExactSymbolAtPoint(uri, position, word);
    if (exactSymbol === undefined) {
        return null;
    }
    const allSymbols = analyzer_1.analyzer.getAllSymbols(uri).filter(symbol => symbol.name === word && symbol.kind === exactSymbol.kind);
    const edits = {
        changes: {
            [uri]: allSymbols.map((symbol) => {
                return {
                    range: symbol.location.range,
                    newText: newName
                };
            })
        }
    };
    return edits;
}
function onPrepareRenameHandler(onPrepareRenameParams) {
    const { textDocument: { uri }, position } = onPrepareRenameParams;
    const word = analyzer_1.analyzer.wordAtPoint(uri, position.line, position.character);
    if (word === null) {
        return null;
    }
    const exactSymbol = analyzer_1.analyzer.findExactSymbolAtPoint(uri, position, word);
    if (exactSymbol === undefined) {
        return null;
    }
    return {
        range: exactSymbol.location.range,
        placeholder: exactSymbol.name
    };
}
//# sourceMappingURL=onRename.js.map