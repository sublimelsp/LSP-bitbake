/**
 * Inspired by bash-language-server under MIT
 * Reference: https://github.com/bash-lsp/bash-language-server/blob/8c42218c77a9451b308839f9a754abde901323d5/server/src/analyser.ts
 */
import { type TextDocumentPositionParams, type Diagnostic, SymbolInformation, Range, Position, Location } from 'vscode-languageserver';
import type Parser from 'web-tree-sitter';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { type BitbakeSymbolInformation, type GlobalDeclarations } from './declarations';
import { type SyntaxNode, type Tree } from 'web-tree-sitter';
import { type DirectiveStatementKeyword } from '../lib/src/types/directiveKeywords';
import { type ParsedPath } from 'path';
import { type ElementInfo } from '../lib/src/types/BitbakeScanResult';
import { type RequestResult } from '../lib/src/types/requests';
export interface AnalyzedDocument {
    version: number;
    document: TextDocument;
    globalDeclarations: GlobalDeclarations;
    variableExpansionSymbols: BitbakeSymbolInformation[];
    bashGlobalSymbols: BitbakeSymbolInformation[];
    pythonDatastoreVariableSymbols: BitbakeSymbolInformation[];
    pythonGlobalFunctionCalls: BitbakeSymbolInformation[];
    includeFileUris: string[];
    bitBakeTree: Parser.Tree;
    bashTree: Parser.Tree;
}
interface LastScanResult {
    symbols: BitbakeSymbolInformation[];
    includeHistory: ParsedPath[];
}
export default class Analyzer {
    private bitBakeParser?;
    private bashParser?;
    private uriToAnalyzedDocument;
    private readonly uriToLastScanResult;
    private lastGlobalEnvScanResult;
    private uriToRecipeLocalFiles;
    getDocumentTexts(uri: string): string[] | undefined;
    getAnalyzedDocument(uri: string): AnalyzedDocument | undefined;
    /**
    * Get the scan result for the current file if it is a recipe file or get the global scan result if it is a .conf or .bbclass file.
    */
    getLastScanResult(uri: string): LastScanResult | undefined;
    getRecipeLastScanResult(recipe: string): LastScanResult | undefined;
    getRecipeLocalFiles(uri: string): RequestResult['getRecipeLocalFiles'] | undefined;
    setRecipeLocalFiles(uri: string, recipeLocalFiles: RequestResult['getRecipeLocalFiles']): void;
    clearRecipeLocalFiles(): void;
    getIncludeUrisForUri(uri: string): string[];
    getVariableExpansionSymbols(uri: string): BitbakeSymbolInformation[];
    getBashGlobalSymbols(uri: string): BitbakeSymbolInformation[];
    getPythonDatastoreVariableSymbols(uri: string): BitbakeSymbolInformation[];
    getPythonGlobalFunctionCallsSymbols(uri: string): BitbakeSymbolInformation[];
    getAllSymbols(uri: string): BitbakeSymbolInformation[];
    removeLastScanResultForRecipe(recipe: string): void;
    removeLastGlobalEnvScanResult(): void;
    initialize(bitBakeParser: Parser, bashParser: Parser): void;
    analyze({ document, uri }: {
        document: TextDocument;
        uri: string;
    }): Diagnostic[];
    private generateBitBakeTree;
    private generateBashTree;
    private executeAnalyzation;
    getSymbolsFromBitBakeTree({ bitBakeTree, uri }: {
        bitBakeTree: Tree;
        uri: string;
    }): {
        variableExpansionSymbols: BitbakeSymbolInformation[];
        pythonDatastoreVariableSymbols: BitbakeSymbolInformation[];
        pythonGlobalFunctionCalls: BitbakeSymbolInformation[];
    };
    getSymbolsFromBashTree({ bashTree, uri }: {
        bashTree: Tree;
        uri: string;
    }): {
        bashGlobalSymbols: BitbakeSymbolInformation[];
    };
    getGlobalDeclarationSymbols(uri: string): BitbakeSymbolInformation[];
    private getAllSymbolsFromGlobalDeclarations;
    findExactSymbolAtPoint(uri: string, position: Position, wordAtPoint: string): BitbakeSymbolInformation | undefined;
    getParsedBitBakeTreeForUri(uri: string): Tree | undefined;
    getParsedBashTreeForUri(uri: string): Tree | undefined;
    /**
     * Find the full word at the given point.
     */
    wordAtPoint(uri: string, line: number, column: number): string | null;
    wordAtPointFromTextPosition(params: TextDocumentPositionParams): string | null;
    hasParsers(): boolean;
    resetAnalyzedDocuments(): void;
    /**
     * Get the directive keyword whether the expression is a directive statement by looking up the tree nodes
     */
    getDirectiveStatementKeywordByNodeType(params: TextDocumentPositionParams): DirectiveStatementKeyword | undefined;
    getDirectivePathForPosition(params: TextDocumentPositionParams): string | undefined;
    isIdentifier(params: TextDocumentPositionParams): boolean;
    isFunctionIdentifier(params: TextDocumentPositionParams): boolean;
    isString(uri: string, line: number, column: number): boolean;
    isStringContent(uri: string, line: number, column: number): boolean;
    /**
     * Check if the current position is inside a string content of a variable assignment.
     * Pass an array of variable names to check if the string content is of any of the variable assignments.
     */
    isStringContentOfVariableAssignment(uri: string, line: number, column: number, variableNames?: string[]): boolean;
    isOverride(uri: string, line: number, column: number): boolean;
    isBuggyIdentifier(node: SyntaxNode): boolean;
    isInsideBashRegion(node: SyntaxNode): boolean;
    isInsidePythonRegion(node: SyntaxNode): boolean;
    isPythonDatastoreVariable(n: Parser.SyntaxNode, includeOpeningQuote?: boolean): boolean;
    /**
     * Check if the variable expansion syntax is being typed. Only for expressions that reference variables. \
     * Example:
     * ```
     * NAME = "foo"
     * DESCRIPTION = "Name: ${NAME}"
     * ```
     */
    isBitBakeVariableExpansion(uri: string, line: number, column: number): boolean;
    isBashVariableName(uri: string, line: number, column: number): boolean;
    /**
     * Check if the node is the identifier in a variable assignment syntax (identifiers are only on the left hand side)
     */
    isIdentifierOfVariableAssignment(params: TextDocumentPositionParams): boolean;
    isVariableFlag(params: TextDocumentPositionParams): boolean;
    rangeForWordAtPoint(params: TextDocumentPositionParams): Range | undefined;
    /**
     * Check if the current line starts with any directive statement keyword defined in 'DirectiveStatementKeyword'
     *
     * Tree-sitter functionalities are not used here since they (as of @1.0.1) can't reliably treat a line as directive statement if the keyword presents but nothing follows.
     */
    getDirectiveStatementKeywordByLine(textDocumentPositionParams: TextDocumentPositionParams): DirectiveStatementKeyword | undefined;
    /**
     * Get the keyword based on the node type in the tree
     */
    getKeywordForPosition(uri: string, line: number, column: number): string | undefined;
    /**
     * Find the node at the given point.
     */
    private nodeAtPoint;
    bitBakeNodeAtPoint(uri: string, line: number, column: number): Parser.SyntaxNode | null;
    private bashNodeAtPoint;
    extractIncludeFileUris(uri: string, bitBakeTree?: Parser.Tree): string[];
    /**
     * The files pointed by the include URIs will analyzed if not yet done so such that the symbols in the included files are available for querying.
     */
    private sourceIncludeFiles;
    getDirectiveFileUris(parsedTree: Parser.Tree): string[];
    findFilesInProjectScanner(filePath: string): ElementInfo[];
    /**
     * Extract symbols from the string content of the tree
     */
    getSymbolsInStringContent(uri: string, line: number, character: number): SymbolInformation[];
    getLinksInStringContent(uri: string): Array<{
        value: string;
        range: Range;
    }>;
    positionIsInRange(line: number, character: number, range: Range): boolean;
    private calculateSymbolPositionInStringContent;
    /**
     *
     * @param n The syntax node of type `string_content`
     * @param regex The regex to match the symbols
     * @param func The custom function to process the matched symbols
     */
    private processSymbolsInStringContent;
    /**
     * Process scan results sent from the client. The scan results are generated by bitbake -e <recipe> command
     */
    processRecipeScanResults(scanResult: string, chosenRecipe: string): void;
    processGlobalEnvScanResults(scanResult: string): void;
    private processEnvScanResults;
    private extractIncludeHistory;
    /**
     * @param symbol The symbol to match
     * @param lookUpSymbolList The list of symbols to look up the symbol
     * @returns The symbol that matches the symbol in the scan results
     *
     * Match the symbol in the scan results with the symbol in the original document. If the exact symbol is not found, it will try to find the symbol without 0 overrides as fallback
     */
    matchSymbol(symbol: BitbakeSymbolInformation, lookUpSymbolList: BitbakeSymbolInformation[]): BitbakeSymbolInformation | undefined;
    resolveSymbol(symbol: BitbakeSymbolInformation, lookUpSymbolList: BitbakeSymbolInformation[]): BitbakeSymbolInformation;
    resolveSymbol(symbol: string, lookUpSymbolList: BitbakeSymbolInformation[]): string;
    private resolveVariableExpansionValues;
    extractModificationHistoryFromComments(symbol: BitbakeSymbolInformation): Location[];
    /**
     *
     * @param symbolA
     * @param symbolB
     * @returns
     *
     * This functions doesn't check the deep equality of the two symbols. It only checkes the neccesary fields to determine if the two symbols are referring the same thing in the file.
     */
    symbolsAreTheSame(symbolA: BitbakeSymbolInformation, symbolB: BitbakeSymbolInformation): boolean;
}
export declare const analyzer: Analyzer;
export {};
