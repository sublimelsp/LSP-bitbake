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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateParser = generateParser;
exports.generateBitBakeParser = generateBitBakeParser;
exports.generateBashParser = generateBashParser;
/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/parser.ts
 */
const path = __importStar(require("path"));
const web_tree_sitter_1 = __importDefault(require("web-tree-sitter"));
async function generateParser(wasmPath) {
    await web_tree_sitter_1.default.init();
    const parser = new web_tree_sitter_1.default();
    const language = await web_tree_sitter_1.default.Language.load(wasmPath);
    parser.setLanguage(language);
    return parser;
}
async function generateBitBakeParser() {
    const wasmPath = path.join(__dirname, '/../../tree-sitter-bitbake.wasm');
    return await generateParser(wasmPath);
}
async function generateBashParser() {
    const wasmPath = path.join(__dirname, '/../../tree-sitter-bash.wasm');
    return await generateParser(wasmPath);
}
//# sourceMappingURL=parser.js.map