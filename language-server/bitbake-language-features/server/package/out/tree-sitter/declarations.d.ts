/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/util/declarations.ts
 */
import * as LSP from 'vscode-languageserver/node';
import type * as Parser from 'web-tree-sitter';
export interface BitbakeSymbolInformation extends LSP.SymbolInformation {
    overrides: string[];
    finalValue?: string;
    commentsAbove: string[];
}
/**
 * An object that contains the symbol information of all the global declarations.
 * Referenced by the symbol name
 */
export type GlobalDeclarations = Record<string, BitbakeSymbolInformation[]>;
/**
 * Returns declarations (functions or variables) from a given root node as well as the comments above the declaration
 * This currently does not include global variables defined inside other code blocks (e.g. if statement & functions)
 *
 */
export declare function getGlobalDeclarations({ bitBakeTree, uri, getFinalValue }: {
    bitBakeTree: Parser.Tree;
    uri: string;
    getFinalValue?: boolean;
}): GlobalDeclarations;
export declare function nodeToSymbolInformation({ node, uri, getFinalValue, isBitBakeVariableExpansion }: {
    node: Parser.SyntaxNode;
    uri: string;
    getFinalValue?: boolean;
    isBitBakeVariableExpansion?: boolean;
}): BitbakeSymbolInformation | null;
