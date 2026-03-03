import { type SemanticTokens, type SemanticTokensLegend } from 'vscode-languageserver/node';
interface ParsedToken {
    line: number;
    startCharacter: number;
    length: number;
    tokenType: string;
    tokenModifiers: string[];
}
export declare const TOKEN_LEGEND: {
    types: {
        function: string;
        variable: string;
        parameter: string;
        class: string;
        number: string;
        operator: string;
        string: string;
        keyword: string;
    };
    modifiers: {
        declaration: string;
        deprecated: string;
        modification: string;
        readonly: string;
    };
};
export declare const legend: SemanticTokensLegend;
export declare function getBashParsedTokens(uri: string): ParsedToken[];
export declare function getBitBakeParsedTokens(uri: string): ParsedToken[];
export declare function getParsedTokens(uri: string): ParsedToken[];
export declare function getSemanticTokens(uri: string): SemanticTokens;
export {};
