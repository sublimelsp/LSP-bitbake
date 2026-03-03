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
exports.getPythonHeader = exports.generatePythonEmbeddedLanguageDoc = exports.imports = void 0;
const TreeSitterUtils = __importStar(require("../tree-sitter/utils"));
const utils_1 = require("./utils");
exports.imports = [
    'import bb, bb.build, bb.compress.zstd, bb.data, bb.data_smart, bb.event, bb.fetch2, bb.parse, bb.persist_data, bb.process, bb.progress, bb.runqueue, bb.siggen, bb.utils',
    'import oe.data, oe.path, oe.utils, oe.types, oe.package, oe.packagegroup, oe.sstatesig, oe.lsb, oe.cachedpath, oe.license, oe.qa, oe.reproducible, oe.rust, oe.buildcfg',
    'd = bb.data_smart.DataSmart()',
    'e = bb.event.Event()',
    'e.data = d',
    'import os'
];
const generatePythonEmbeddedLanguageDoc = (textDocument, bitBakeTree) => {
    const embeddedLanguageDoc = (0, utils_1.initEmbeddedLanguageDoc)(textDocument, 'python');
    TreeSitterUtils.forEach(bitBakeTree.rootNode, (node) => {
        switch (node.type) {
            case 'python_function_definition':
                handlePythonFunctionDefinition(node, embeddedLanguageDoc);
                return false;
            case 'anonymous_python_function':
                handleAnonymousPythonFunction(node, embeddedLanguageDoc);
                return false;
            case 'inline_python':
                handleInlinePythonNode(node, embeddedLanguageDoc);
                return false;
            default:
                return true;
        }
    });
    insertHeader(embeddedLanguageDoc);
    return embeddedLanguageDoc;
};
exports.generatePythonEmbeddedLanguageDoc = generatePythonEmbeddedLanguageDoc;
const getPythonHeader = (originalUri) => {
    const headers = [
        `# Original BitBake document: ${originalUri}`,
        ...exports.imports,
        ''
    ].join('\n');
    return headers;
};
exports.getPythonHeader = getPythonHeader;
const insertHeader = (embeddedLanguageDoc) => {
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, 0, 0, (0, exports.getPythonHeader)(embeddedLanguageDoc.originalUri));
};
const handlePythonFunctionDefinition = (node, embeddedLanguageDoc) => {
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, node.startIndex, node.endIndex, node.text);
    node.children.forEach((child) => {
        if (child.type === 'block') {
            handleBlockNode(child, embeddedLanguageDoc);
        }
    });
};
const handleAnonymousPythonFunction = (node, embeddedLanguageDoc) => {
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, node.startIndex, node.endIndex, node.text);
    node.children.forEach((child) => {
        switch (child.type) {
            case 'fakeroot':
                handleFakerootNode(child, embeddedLanguageDoc);
                break;
            case 'python':
                (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, child.startIndex, child.endIndex, 'def');
                if (child.nextSibling?.type === '(') {
                    // if there is no identfier, we add a dummy one
                    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, child.endIndex, child.endIndex, ' _ ');
                }
                break;
            case 'identifier':
                break;
            case 'override':
                handleOverrideNode(child, embeddedLanguageDoc);
                break;
            case '{':
                (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, child.startIndex, child.endIndex, ':');
                break;
            case '}':
                (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, child.startIndex, child.endIndex, '');
                break;
            case 'block':
                handleBlockNode(child, embeddedLanguageDoc);
                break;
            default:
                break;
        }
    });
};
const handleInlinePythonNode = (inlinePythonNode, embeddedLanguageDoc) => {
    const openingNode = inlinePythonNode.child(0);
    const pythonContentNode = inlinePythonNode.child(1);
    const closingNode = inlinePythonNode.child(2);
    if (openingNode?.type !== '${@') {
        return;
    }
    if (pythonContentNode === null) {
        return;
    }
    if (closingNode?.type !== '}') {
        return;
    }
    // We put the inline_python content on a new line
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, openingNode.startIndex, openingNode.endIndex, '  \n');
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, pythonContentNode.startIndex, pythonContentNode.startIndex, '\n'); // prevent trailing spaces
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, pythonContentNode.startIndex, pythonContentNode.endIndex, pythonContentNode.text);
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, closingNode.startIndex, closingNode.endIndex, '\n');
    handleBlockNode(pythonContentNode, embeddedLanguageDoc);
};
const handleBlockNode = (blockNode, embeddedLanguageDoc) => {
    if (blockNode.text === '') {
        (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, blockNode.startIndex, blockNode.endIndex, '\n  pass');
    }
};
const handleFakerootNode = (inlinePythonNode, embeddedLanguageDoc) => {
    const nextNode = inlinePythonNode.nextSibling;
    if (nextNode === null) {
        console.debug('[handleFakerootNode]: nextNode is null');
        return;
    }
    // Remove fakeroot with the spaces between it and the next node in order to keep proper indentation
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, inlinePythonNode.startIndex, nextNode.startIndex, '');
};
const handleOverrideNode = (overrideNode, embeddedLanguageDoc) => {
    // Replace it by space
    (0, utils_1.insertTextIntoEmbeddedLanguageDoc)(embeddedLanguageDoc, overrideNode.startIndex, overrideNode.endIndex, ' '.repeat(overrideNode.text.length));
};
//# sourceMappingURL=python-support.js.map