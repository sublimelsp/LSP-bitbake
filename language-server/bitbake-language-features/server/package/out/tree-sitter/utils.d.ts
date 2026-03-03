/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/util/tree-sitter.ts
 */
import * as LSP from 'vscode-languageserver/node';
import type { SyntaxNode } from 'web-tree-sitter';
/**
 * Recursively iterate over all nodes in a tree.
 *
 * @param node The node to start iterating from
 * @param callback The callback to call for each node. Return false to stop following children.
 */
export declare function forEach(node: SyntaxNode, callback: (n: SyntaxNode) => boolean): void;
export declare function range(n: SyntaxNode): LSP.Range;
export declare function isDefinition(n: SyntaxNode): boolean;
export declare function isInlinePython(n: SyntaxNode): boolean;
export declare function isPythonDefinition(n: SyntaxNode): boolean;
export declare function isShellDefinition(n: SyntaxNode): boolean;
export declare function isVariableReference(n: SyntaxNode): boolean;
/**
 * Check if the node is an override other than `append`, `prepend` or `remove`
 */
export declare function isOverride(n: SyntaxNode): boolean;
export declare function isBitbakeOperator(n: SyntaxNode): boolean;
export declare function isFunctionIdentifier(n: SyntaxNode): boolean;
/**
 * Find the node's parent that passes the predicate
 */
export declare function findParent(start: SyntaxNode, predicate: (n: SyntaxNode) => boolean): SyntaxNode | null;
