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
exports.legend = exports.TOKEN_LEGEND = void 0;
exports.getBashParsedTokens = getBashParsedTokens;
exports.getBitBakeParsedTokens = getBitBakeParsedTokens;
exports.getParsedTokens = getParsedTokens;
exports.getSemanticTokens = getSemanticTokens;
const node_1 = require("vscode-languageserver/node");
const OutputLogger_1 = require("./lib/src/utils/OutputLogger");
const analyzer_1 = require("./tree-sitter/analyzer");
const TreeSitterUtils = __importStar(require("./tree-sitter/utils"));
const tokenTypes = new Map();
const tokenModifiers = new Map();
// https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
exports.TOKEN_LEGEND = {
    types: {
        function: 'function',
        variable: 'variable',
        parameter: 'parameter',
        class: 'class',
        number: 'number',
        operator: 'operator',
        string: 'string',
        keyword: 'keyword'
    },
    modifiers: {
        declaration: 'declaration',
        deprecated: 'deprecated',
        modification: 'modification',
        readonly: 'readonly'
    }
};
const generateSemanticTokensLegend = () => {
    const tokenTypesLegend = [
        ...Object.keys(exports.TOKEN_LEGEND.types)
    ];
    tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));
    const tokenModifiersLegend = [
        ...Object.keys(exports.TOKEN_LEGEND.modifiers)
    ];
    tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));
    return { tokenTypes: tokenTypesLegend, tokenModifiers: tokenModifiersLegend };
};
exports.legend = generateSemanticTokensLegend();
// Check node_modules/@types/vscode/index.d.ts for more encoding details
function encodeTokenType(tokenType) {
    if (tokenTypes.has(tokenType)) {
        return Number(tokenTypes.get(tokenType));
    }
    else if (tokenType === 'notInLegend') {
        return tokenTypes.size + 2;
    }
    return 0;
}
function encodeTokenModifiers(strTokenModifiers) {
    let result = 0;
    for (let i = 0; i < strTokenModifiers.length; i++) {
        const tokenModifier = strTokenModifiers[i];
        if (tokenModifiers.has(tokenModifier)) {
            result = result | (1 << Number(tokenModifiers.get(tokenModifier)));
        }
        else if (tokenModifier === 'notInLegend') {
            result = result | (1 << tokenModifiers.size + 2);
        }
    }
    return result;
}
function getBashParsedTokens(uri) {
    const resultTokens = [];
    const Tree = analyzer_1.analyzer.getParsedBashTreeForUri(uri);
    if (Tree === undefined) {
        OutputLogger_1.logger.warn(`[getSemanticTokens] Syntax tree not found for ${uri}`);
        return [];
    }
    TreeSitterUtils.forEach(Tree.rootNode, (node) => {
        const nodeRange = {
            line: node.startPosition.row,
            startCharacter: node.startPosition.column,
            length: Math.max(node.endPosition.column - node.startPosition.column, 0)
        };
        if (node.type === 'variable_name') {
            resultTokens.push({
                ...nodeRange,
                tokenType: exports.TOKEN_LEGEND.types.variable,
                tokenModifiers: []
            });
        }
        if (node.type === 'command_name') {
            resultTokens.push({
                ...nodeRange,
                tokenType: exports.TOKEN_LEGEND.types.function,
                tokenModifiers: []
            });
        }
        // Traverse every node
        return true;
    });
    return resultTokens;
}
function getBitBakeParsedTokens(uri) {
    const resultTokens = [];
    const Tree = analyzer_1.analyzer.getParsedBitBakeTreeForUri(uri);
    if (Tree === undefined) {
        OutputLogger_1.logger.warn(`[getSemanticTokens] Syntax tree not found for ${uri}`);
        return [];
    }
    TreeSitterUtils.forEach(Tree.rootNode, (node) => {
        const nodeRange = {
            line: node.startPosition.row,
            startCharacter: node.startPosition.column,
            length: Math.max(node.endPosition.column - node.startPosition.column, 0)
        };
        if (TreeSitterUtils.isVariableReference(node)) {
            resultTokens.push({
                ...nodeRange,
                tokenType: exports.TOKEN_LEGEND.types.variable,
                tokenModifiers: [exports.TOKEN_LEGEND.modifiers.declaration]
            });
        }
        if (TreeSitterUtils.isOverride(node)) {
            resultTokens.push({
                ...nodeRange,
                // This scope is customized in package.json "operator.readonly"
                tokenType: exports.TOKEN_LEGEND.types.operator,
                tokenModifiers: [exports.TOKEN_LEGEND.modifiers.readonly]
            });
        }
        if (TreeSitterUtils.isBitbakeOperator(node)) {
            resultTokens.push({
                ...nodeRange,
                tokenType: exports.TOKEN_LEGEND.types.keyword,
                tokenModifiers: []
            });
        }
        if (TreeSitterUtils.isFunctionIdentifier(node)) {
            resultTokens.push({
                ...nodeRange,
                tokenType: exports.TOKEN_LEGEND.types.function,
                tokenModifiers: [exports.TOKEN_LEGEND.modifiers.declaration]
            });
        }
        // Traverse every node
        return true;
    });
    return resultTokens;
}
function getParsedTokens(uri) {
    return [
        ...getBitBakeParsedTokens(uri),
        ...getBashParsedTokens(uri)
    ].sort((a, b) => {
        // The tokens are encoded relative to each other. It breaks when they are not in order.
        if (a.line === b.line) {
            return a.startCharacter - b.startCharacter;
        }
        return a.line - b.line;
    });
}
function getSemanticTokens(uri) {
    const resultTokens = getParsedTokens(uri);
    const builder = new node_1.SemanticTokensBuilder();
    resultTokens.forEach(token => {
        builder.push(token.line, token.startCharacter, token.length, encodeTokenType(token.tokenType), encodeTokenModifiers(token.tokenModifiers));
    });
    return builder.build();
}
//# sourceMappingURL=semanticTokens.js.map