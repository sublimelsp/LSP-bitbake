"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMethod = exports.RequestType = void 0;
var RequestType;
(function (RequestType) {
    RequestType["EmbeddedLanguageTypeOnPosition"] = "EmbeddedLanguageTypeOnPosition";
    RequestType["getLinksInDocument"] = "getLinksInDocument";
    RequestType["ProcessRecipeScanResults"] = "ProcessRecipeScanResults";
    RequestType["ProcessGlobalEnvScanResults"] = "ProcessGlobalEnvScanResults";
    RequestType["GetVar"] = "getVar";
    RequestType["GetRecipeLocalFiles"] = "getRecipeLocalFiles";
})(RequestType || (exports.RequestType = RequestType = {}));
exports.RequestMethod = {
    [RequestType.EmbeddedLanguageTypeOnPosition]: 'bitbake/requestEmbeddedLanguageDocInfos',
    [RequestType.getLinksInDocument]: 'bitbake/getLinksInDocument',
    [RequestType.ProcessRecipeScanResults]: 'bitbake/ProcessRecipeScanResults',
    [RequestType.ProcessGlobalEnvScanResults]: 'bitbake/ProcessGlobalEnvScanResults',
    [RequestType.GetVar]: 'bitbake/getVar',
    [RequestType.GetRecipeLocalFiles]: 'bitbake/getRecipeLocalFiles'
};
//# sourceMappingURL=requests.js.map