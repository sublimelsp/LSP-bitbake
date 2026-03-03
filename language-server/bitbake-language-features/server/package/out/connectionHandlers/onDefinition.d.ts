import { type TextDocumentPositionParams, Location, type Connection } from 'vscode-languageserver/node';
import { type BitbakeSymbolInformation } from '../tree-sitter/declarations';
export declare function setDefinitionsConnection(conn: Connection): void;
export declare function onDefinitionHandler(textDocumentPositionParams: TextDocumentPositionParams): Promise<Location[] | null>;
export declare function getAllDefinitionSymbolsForSymbolAtPoint(uri: string, word: string, symbolAtPoint: BitbakeSymbolInformation | undefined): BitbakeSymbolInformation[];
