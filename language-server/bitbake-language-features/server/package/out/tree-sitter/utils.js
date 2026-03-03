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
exports.forEach = forEach;
exports.range = range;
exports.isDefinition = isDefinition;
exports.isInlinePython = isInlinePython;
exports.isPythonDefinition = isPythonDefinition;
exports.isShellDefinition = isShellDefinition;
exports.isVariableReference = isVariableReference;
exports.isOverride = isOverride;
exports.isBitbakeOperator = isBitbakeOperator;
exports.isFunctionIdentifier = isFunctionIdentifier;
exports.findParent = findParent;
/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/util/tree-sitter.ts
 */
const LSP = __importStar(require("vscode-languageserver/node"));
/**
 * Recursively iterate over all nodes in a tree.
 *
 * @param node The node to start iterating from
 * @param callback The callback to call for each node. Return false to stop following children.
 */
function forEach(node, callback) {
    const followChildren = callback(node);
    if (followChildren && node.children.length > 0) {
        node.children.forEach((n) => { forEach(n, callback); });
    }
}
function range(n) {
    return LSP.Range.create(n.startPosition.row, n.startPosition.column, n.endPosition.row, n.endPosition.column);
}
function isDefinition(n) {
    switch (n.type) {
        case 'variable_assignment':
        case 'function_definition': // Shell functions
        case 'anonymous_python_function': // Functions start with keyword python
        case 'python_function_definition': // Functions start with keyword def
            return true;
        default:
            return false;
    }
}
function isInlinePython(n) {
    return n.type === 'inline_python';
}
function isPythonDefinition(n) {
    return n.type === 'anonymous_python_function' || n.type === 'python_function_definition';
}
function isShellDefinition(n) {
    return n.type === 'function_definition';
}
function isVariableReference(n) {
    switch (n.type) {
        case 'identifier':
            return n?.parent?.type === 'variable_assignment' || n?.parent?.type === 'variable_expansion';
        default:
            return false;
    }
}
/**
 * Check if the node is an override other than `append`, `prepend` or `remove`
 */
function isOverride(n) {
    /**
     * Example:
     * FOO:append:override1:${PN}:${PN}-foo () {}
     *
     * Tree node:
     *    (function_definition [0, 0] - [0, 42]
            (identifier [0, 0] - [0, 3])
            (override [0, 3] - [0, 36]
              (identifier [0, 11] - [0, 20])
              (variable_expansion [0, 21] - [0, 26]
                (identifier [0, 23] - [0, 25]))
              (concatenation [0, 27] - [0, 36]
                (variable_expansion [0, 27] - [0, 32]
                  (identifier [0, 29] - [0, 31]))
                (identifier [0, 32] - [0, 36])))))
     */
    const parentType = n?.parent?.type;
    switch (n.type) {
        case 'identifier':
            return parentType === 'override' || parentType === 'concatenation';
        default:
            return false;
    }
}
function isBitbakeOperator(n) {
    switch (n.type) {
        case 'append':
        case 'prepend':
        case 'remove':
            return true;
        default:
            return false;
    }
}
function isFunctionIdentifier(n) {
    switch (n.type) {
        case 'identifier':
            return n?.parent?.type === 'function_definition' ||
                n?.parent?.type === 'anonymous_python_function';
        case 'python_identifier':
            return n?.parent?.type === 'python_function_definition';
        default:
            return false;
    }
}
/**
 * Find the node's parent that passes the predicate
 */
function findParent(start, predicate) {
    let node = start.parent;
    while (node !== null) {
        if (predicate(node)) {
            return node;
        }
        node = node.parent;
    }
    return null;
}
//# sourceMappingURL=utils.js.map