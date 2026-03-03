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
exports.getBashHeader = exports.generateBashEmbeddedLanguageDoc = void 0;
const TreeSitterUtils = __importStar(require("../tree-sitter/utils"));
const utils_1 = require("./utils");
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const shebang = '#!/bin/sh\n';
// Diagnostics to disable with the VS Code extension ShellCheck.
// These would appear incorrectly, and we have not managed to find a proper workaround.
const shellcheckDisables = [
    // "Command appears to be unreachable." This happens because we remove the overiddes and functions end up having the same names.
    '# shellcheck disable=SC2317'
];
const generateBashEmbeddedLanguageDoc = (textDocument, bitBakeTree, shouldKeepExactPositions, // Indicates the positions in the generated document should map exactly with the original document
pokyFolder) => {
    const embeddedLanguageDoc = (0, utils_1.initEmbeddedLanguageDoc)(textDocument, 'bash');
    TreeSitterUtils.forEach(bitBakeTree.rootNode, (node) => {
        switch (node.type) {
            case 'recipe':
                return true;
            case 'function_definition':
                handleFunctionDefinitionNode(node, embeddedLanguageDoc);
                return false;
            default:
                return false;
        }
    });
    if (!shouldKeepExactPositions) {
        insertBashHeader(embeddedLanguageDoc);
        if (pokyFolder !== undefined) {
            insertBashTools(embeddedLanguageDoc, pokyFolder);
        }
    }
    return embeddedLanguageDoc;
};
exports.generateBashEmbeddedLanguageDoc = generateBashEmbeddedLanguageDoc;
const getBashHeader = (originalUri) => {
    return [
        shebang,
        `# Original BitBake document: ${originalUri}`,
        ...shellcheckDisables,
        ''
    ].join('\n');
};
exports.getBashHeader = getBashHeader;
const insertBashHeader = (embeddedLanguageDoc) => {
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, 0, 0, (0, exports.getBashHeader)(embeddedLanguageDoc.originalUri));
};
const insertBashTools = (embeddedLanguageDoc, pokyFolder) => {
    const bashTools = [
        `. ${pokyFolder}/meta/classes-global/logging.bbclass`,
        `. ${pokyFolder}/meta/classes-global/base.bbclass`,
        ''
    ].join('\n');
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, 0, 0, bashTools);
};
const handleFunctionDefinitionNode = (node, embeddedLanguageDoc) => {
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, node.startIndex, node.endIndex, node.text);
    node.children.forEach((child) => {
        switch (child.type) {
            case 'fakeroot':
                handleFakerootNode(child, embeddedLanguageDoc);
                break;
            case 'override':
                handleOverrideNode(child, embeddedLanguageDoc);
                break;
            case 'inline_python':
                handleInlinePythonNode(child, embeddedLanguageDoc);
                break;
            default:
                break;
        }
    });
};
const handleInlinePythonNode = (inlinePythonNode, embeddedLanguageDoc) => {
    // Example:
    // if [ "${@d.getVar('FOO')}" = "0" ] ;
    // will become
    // if [ "${?               }" = "0" ] ;
    // Replacing the whole inline_python by spaces would create a constant string and might trigger a warning if the spellcheck
    // extension is activated, since the comparison with "0" would always give the same result
    // ${?} is an arbitrary value that is expected not to cause any trouble.
    const trailingSpacesLength = inlinePythonNode.text.length - 4;
    if (trailingSpacesLength <= 0) {
        // This is expected to never happen
        OutputLogger_1.logger.error(`[handleInlinePythonNode (Bash)] Invalid string length for node ${inlinePythonNode.toString()}`);
        return;
    }
    const replacement = `\${?${' '.repeat(trailingSpacesLength)}}`;
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, inlinePythonNode.startIndex, inlinePythonNode.endIndex, replacement);
};
const handleFakerootNode = (inlinePythonNode, embeddedLanguageDoc) => {
    // Replace it by spaces
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, inlinePythonNode.startIndex, inlinePythonNode.endIndex, ' '.repeat(inlinePythonNode.text.length));
};
const handleOverrideNode = (overrideNode, embeddedLanguageDoc) => {
    // Replace it by spaces
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, overrideNode.startIndex, overrideNode.endIndex, ' '.repeat(overrideNode.text.length));
};
//# sourceMappingURL=bash-support.js.map