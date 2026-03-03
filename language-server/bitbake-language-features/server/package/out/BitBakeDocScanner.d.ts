/**
 *  The data scanned from documents
 */
export interface DocInfo {
    name: string;
    definition: string;
    referenceUrl?: string;
    docSource?: string;
    insertText?: string;
}
export interface VariableInfo extends DocInfo {
    validFiles?: RegExp[];
    suffixType?: SuffixType;
}
type SuffixType = 'layer' | 'providedItem' | undefined;
export type DocInfoType = DocInfo[] | VariableInfo[];
export declare class BitBakeDocScanner {
    private _bitbakeVariableInfo;
    private _yoctoVariableInfo;
    private _variableFlagInfo;
    private _yoctoTaskInfo;
    private _pythonDatastoreFunction;
    private readonly _docPath;
    private readonly _keywordInfo;
    get bitbakeVariableInfo(): VariableInfo[];
    get yoctoVariableInfo(): VariableInfo[];
    get variableFlagInfo(): DocInfo[];
    get yoctoTaskInfo(): DocInfo[];
    get keywordInfo(): DocInfo[];
    get pythonDatastoreFunction(): string[];
    clearScannedDocs(): void;
    parseDocs(): void;
    parseBitbakeVariablesFile(): void;
    parseYoctoVariablesFile(): void;
    parseYoctoTaskFile(): void;
    parseVariableFlagFile(): void;
    parsePythonDatastoreFunction(): void;
}
export declare const bitBakeDocScanner: BitBakeDocScanner;
export {};
