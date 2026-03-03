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
exports.symbolKindToCompletionKind = symbolKindToCompletionKind;
/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/server.ts#L754
 */
const LSP = __importStar(require("vscode-languageserver/node"));
function symbolKindToCompletionKind(s) {
    switch (s) {
        case LSP.SymbolKind.File:
            return LSP.CompletionItemKind.File;
        case LSP.SymbolKind.Module:
        case LSP.SymbolKind.Namespace:
        case LSP.SymbolKind.Package:
            return LSP.CompletionItemKind.Module;
        case LSP.SymbolKind.Class:
            return LSP.CompletionItemKind.Class;
        case LSP.SymbolKind.Method:
            return LSP.CompletionItemKind.Method;
        case LSP.SymbolKind.Property:
            return LSP.CompletionItemKind.Property;
        case LSP.SymbolKind.Field:
            return LSP.CompletionItemKind.Field;
        case LSP.SymbolKind.Constructor:
            return LSP.CompletionItemKind.Constructor;
        case LSP.SymbolKind.Enum:
            return LSP.CompletionItemKind.Enum;
        case LSP.SymbolKind.Interface:
            return LSP.CompletionItemKind.Interface;
        case LSP.SymbolKind.Function:
            return LSP.CompletionItemKind.Function;
        case LSP.SymbolKind.Variable:
            return LSP.CompletionItemKind.Variable;
        case LSP.SymbolKind.Constant:
            return LSP.CompletionItemKind.Constant;
        case LSP.SymbolKind.String:
        case LSP.SymbolKind.Number:
        case LSP.SymbolKind.Boolean:
        case LSP.SymbolKind.Array:
        case LSP.SymbolKind.Key:
        case LSP.SymbolKind.Null:
            return LSP.CompletionItemKind.Text;
        case LSP.SymbolKind.Object:
            return LSP.CompletionItemKind.Module;
        case LSP.SymbolKind.EnumMember:
            return LSP.CompletionItemKind.EnumMember;
        case LSP.SymbolKind.Struct:
            return LSP.CompletionItemKind.Struct;
        case LSP.SymbolKind.Event:
            return LSP.CompletionItemKind.Event;
        case LSP.SymbolKind.Operator:
            return LSP.CompletionItemKind.Operator;
        case LSP.SymbolKind.TypeParameter:
            return LSP.CompletionItemKind.TypeParameter;
        default:
            return LSP.CompletionItemKind.Text;
    }
}
//# sourceMappingURL=lsp.js.map