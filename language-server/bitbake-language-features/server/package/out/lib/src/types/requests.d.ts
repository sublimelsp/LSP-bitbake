import { type Range, type Position } from 'vscode';
import { type EmbeddedLanguageType } from './embedded-languages';
export declare enum RequestType {
    EmbeddedLanguageTypeOnPosition = "EmbeddedLanguageTypeOnPosition",
    getLinksInDocument = "getLinksInDocument",
    ProcessRecipeScanResults = "ProcessRecipeScanResults",
    ProcessGlobalEnvScanResults = "ProcessGlobalEnvScanResults",
    GetVar = "getVar",
    GetRecipeLocalFiles = "getRecipeLocalFiles"
}
export declare const RequestMethod: Record<RequestType, string>;
export interface RequestParams {
    [RequestType.EmbeddedLanguageTypeOnPosition]: {
        uriString: string;
        position: Position;
    };
    [RequestType.getLinksInDocument]: {
        documentUri: string;
    };
    [RequestType.ProcessRecipeScanResults]: {
        scanResults: string;
        uri: unknown;
        chosenRecipe: string;
    };
    [RequestType.ProcessGlobalEnvScanResults]: {
        scanResults: string;
    };
    [RequestType.GetVar]: {
        variable: string;
        recipe: string;
    };
    [RequestType.GetRecipeLocalFiles]: {
        uri: string;
    };
}
export interface RequestResult {
    [RequestType.EmbeddedLanguageTypeOnPosition]: Promise<EmbeddedLanguageType | undefined | null>;
    [RequestType.getLinksInDocument]: Promise<Array<{
        value: string;
        range: Range;
    }>>;
    [RequestType.ProcessRecipeScanResults]: Record<string, unknown> | undefined;
    [RequestType.GetRecipeLocalFiles]: {
        foundFileUris: string[];
        foundDirs: string[];
    };
}
