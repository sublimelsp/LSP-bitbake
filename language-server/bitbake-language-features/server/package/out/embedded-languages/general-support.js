"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbeddedLanguageTypeOnPosition = exports.generateEmbeddedLanguageDocs = void 0;
const bash_support_1 = require("./bash-support");
const python_support_1 = require("./python-support");
const analyzer_1 = require("../tree-sitter/analyzer");
const generateEmbeddedLanguageDocs = (textDocument, pokyFolder) => {
    const analyzedDocument = analyzer_1.analyzer.getAnalyzedDocument(textDocument.uri);
    if (analyzedDocument === undefined) {
        return;
    }
    return [
        (0, bash_support_1.generateBashEmbeddedLanguageDoc)(analyzedDocument.document, analyzedDocument.bitBakeTree, false, pokyFolder),
        (0, python_support_1.generatePythonEmbeddedLanguageDoc)(analyzedDocument.document, analyzedDocument.bitBakeTree)
    ];
};
exports.generateEmbeddedLanguageDocs = generateEmbeddedLanguageDocs;
const getEmbeddedLanguageTypeOnPosition = (uriString, position) => {
    const bitBakeNode = analyzer_1.analyzer.bitBakeNodeAtPoint(uriString, position.line, position.character);
    if (bitBakeNode === null) {
        return undefined;
    }
    if (analyzer_1.analyzer.isInsidePythonRegion(bitBakeNode)) {
        return 'python';
    }
    // isInsidePythonRegion must be tested before isInsideBashRegion because inline_python could be inside a bash region
    // In that case, the position would be first inside a python region, then inside a bash region, but it would be Python code
    if (analyzer_1.analyzer.isInsideBashRegion(bitBakeNode)) {
        return 'bash';
    }
    return undefined;
};
exports.getEmbeddedLanguageTypeOnPosition = getEmbeddedLanguageTypeOnPosition;
//# sourceMappingURL=general-support.js.map