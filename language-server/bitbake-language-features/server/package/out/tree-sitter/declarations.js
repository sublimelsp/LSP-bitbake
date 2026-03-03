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
exports.getGlobalDeclarations = getGlobalDeclarations;
exports.nodeToSymbolInformation = nodeToSymbolInformation;
/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/util/declarations.ts
 */
const LSP = __importStar(require("vscode-languageserver/node"));
const TreeSitterUtil = __importStar(require("./utils"));
const TREE_SITTER_TYPE_TO_LSP_KIND = {
    function_definition: LSP.SymbolKind.Function,
    python_function_definition: LSP.SymbolKind.Function,
    anonymous_python_function: LSP.SymbolKind.Function,
    variable_assignment: LSP.SymbolKind.Variable
};
const GLOBAL_DECLARATION_NODE_TYPES = new Set([
    'function_definition',
    'python_function_definition',
    'anonymous_python_function'
]);
/**
 * Returns declarations (functions or variables) from a given root node as well as the comments above the declaration
 * This currently does not include global variables defined inside other code blocks (e.g. if statement & functions)
 *
 */
function getGlobalDeclarations({ bitBakeTree, uri, getFinalValue = false // Whether to get the final value from the scan results obtained from scan recipe command, which is the only use case as of now
 }) {
    const globalDeclarations = {};
    TreeSitterUtil.forEach(bitBakeTree.rootNode, (node) => {
        const followChildren = !GLOBAL_DECLARATION_NODE_TYPES.has(node.type);
        const symbol = getDeclarationSymbolFromNode({ node, uri, getFinalValue });
        if (symbol !== null) {
            const word = symbol.name;
            // Note that this can include BITBAKE_VARIABLES (e.g DESCRIPTION = ''), it will be used for completion later. But BITBAKE_VARIABLES are also added as completion from doc scanner. The remove of duplicates will happen there.
            if (globalDeclarations[word] === undefined) {
                globalDeclarations[word] = [];
            }
            const commentsAbove = [];
            extractCommentsAbove(node, commentsAbove);
            symbol.commentsAbove = commentsAbove;
            globalDeclarations[word].push(symbol);
        }
        return followChildren;
    });
    return globalDeclarations;
}
function nodeToSymbolInformation({ node, uri, getFinalValue, isBitBakeVariableExpansion = false }) {
    let namedNode = node.firstNamedChild;
    if (isBitBakeVariableExpansion) {
        namedNode = node;
    }
    if (namedNode === null) {
        return null;
    }
    const containerName = TreeSitterUtil.findParent(node, (p) => GLOBAL_DECLARATION_NODE_TYPES.has(p.type))
        ?.firstNamedChild?.text ?? '';
    const kind = TREE_SITTER_TYPE_TO_LSP_KIND[node.type];
    /**
     * Example:
     * FOO:override1:${PN}:${PN}-foo = "foo"
     *
     * Tree node:
     *    (variable_assignment [0, 0] - [0, 31]
            (identifier [0, 0] - [0, 3])
        ->  (override [0, 3] - [0, 23]
          ->  (identifier [0, 4] - [0, 13])
          ->  (variable_expansion [0, 14] - [0, 19]
                (identifier [0, 16] - [0, 18]))
          ->  (concatenation [0, 20] - [0, 29]
                (variable_expansion [0, 20] - [0, 25]
                  (identifier [0, 22] - [0, 24]))
                (identifier [0, 25] - [0, 29])))
     *
     * Note that the append, prepend and remove operators don't have identifiers in the tree
     */
    const overrides = [];
    const overrideChildNode = node.children.find((child) => child.type === 'override');
    if (overrideChildNode !== undefined) {
        overrideChildNode.children.forEach((child) => {
            const validTypes = ['identifier', 'variable_expansion', 'concatenation'];
            if (!validTypes.includes(child.type)) {
                return;
            }
            overrides.push(child.text);
        });
    }
    let symbol = {
        ...LSP.SymbolInformation.create(namedNode.text, kind ?? LSP.SymbolKind.Variable, TreeSitterUtil.range(namedNode), uri, containerName),
        commentsAbove: [],
        overrides
    };
    if (kind === LSP.SymbolKind.Variable && getFinalValue === true) {
        const finalValue = node.children.find((child) => child.type === 'literal')?.firstChild?.firstNamedChild?.text;
        if (finalValue !== undefined) {
            symbol = {
                ...symbol,
                finalValue
            };
        }
    }
    return symbol;
}
function getDeclarationSymbolFromNode({ node, uri, getFinalValue }) {
    if (TreeSitterUtil.isDefinition(node)) {
        // Currently in the tree, all functions start with python keyword have type 'anonymous_python_function', skip when the node is an actual anonymous python function in bitbake that has no identifier
        if (node.type === 'anonymous_python_function' && node.firstNamedChild?.type !== 'identifier') {
            return null;
        }
        return nodeToSymbolInformation({ node, uri, getFinalValue });
    }
    return null;
}
function extractCommentsAbove(node, comments) {
    const previousSibling = node.previousSibling;
    if (previousSibling === null) {
        return;
    }
    if (previousSibling.type === 'comment' && previousSibling.startPosition.row + 1 === node.startPosition.row) {
        const commentValue = previousSibling.text.trim();
        comments.unshift(commentValue);
        extractCommentsAbove(previousSibling, comments);
    }
}
//# sourceMappingURL=declarations.js.map