"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCAN_RESULT_VERSION = void 0;
exports.scanContainsData = scanContainsData;
exports.scanContainsRecipes = scanContainsRecipes;
exports.pathInfoToString = pathInfoToString;
// Make sure to increment this number when the structure of the scan data changes
// This will invalidate previous scan data saved for the workspace
exports.SCAN_RESULT_VERSION = 3;
function scanContainsData(scanResult) {
    return scanResult._layers.length > 0 || scanResult._recipes.length > 0 || scanResult._workspaces.length > 0;
}
function scanContainsRecipes(scanResult) {
    return scanResult._layers.length > 0 || scanResult._recipes.length > 0;
}
function pathInfoToString(pathInfo) {
    return `${pathInfo.dir}/${pathInfo.base}`;
}
//# sourceMappingURL=BitbakeScanResult.js.map