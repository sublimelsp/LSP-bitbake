"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitbakeFileExtensions = void 0;
exports.extractRecipeName = extractRecipeName;
exports.extractRecipeVersion = extractRecipeVersion;
const path_1 = __importDefault(require("path"));
exports.bitbakeFileExtensions = ['.bb', '.bbappend', '.bbclass', '.conf', '.inc'];
function extractRecipeName(filePath) {
    // Ex: gst1.0-plugins-bad_1.18.4.bb -> gst1.0-plugins-bad
    const fileName = extractRecipeFileName(filePath);
    const recipeName = fileName.split('_')[0];
    return recipeName;
}
function extractRecipeVersion(filePath) {
    // Ex: gst1.0-plugins-bad_1.18.4.bb -> 1.18.4
    const fileName = extractRecipeFileName(filePath);
    const version = fileName.split('_')[1];
    return version;
}
function extractRecipeFileName(filePath) {
    // Ex: gst1.0-plugins-bad_1.18.4.bb -> gst1.0-plugins-bad_1.18.4
    const FileName = path_1.default.parse(filePath).base;
    const stringRegex = '(' + exports.bitbakeFileExtensions.map(ext => `\\${ext}`).join('|') + ')$';
    const fileName = FileName.replace(new RegExp(stringRegex, 'g'), '');
    return fileName;
}
//# sourceMappingURL=files.js.map