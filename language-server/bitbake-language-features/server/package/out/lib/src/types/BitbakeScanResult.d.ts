import { type ParsedPath } from 'path';
export declare const SCAN_RESULT_VERSION: number;
export interface LayerInfo {
    name: string;
    path: string;
    priority: number;
}
export interface ElementInfo {
    name: string;
    extraInfo?: string;
    path?: ParsedPath;
    layerInfo?: LayerInfo;
    appends?: ParsedPath[];
    overlayes?: ParsedPath[];
    version?: string;
    skipped?: string;
}
export interface DevtoolWorkspaceInfo {
    name: string;
    path: string;
}
export interface BitbakeScanResult {
    _layers: LayerInfo[];
    _classes: ElementInfo[];
    _includes: ElementInfo[];
    _recipes: ElementInfo[];
    _overrides: string[];
    _confFiles: ElementInfo[];
    _workspaces: DevtoolWorkspaceInfo[];
    _bitbakeVersion: string;
}
export declare function scanContainsData(scanResult: BitbakeScanResult): boolean;
export declare function scanContainsRecipes(scanResult: BitbakeScanResult): boolean;
export declare function pathInfoToString(pathInfo: ParsedPath): string;
