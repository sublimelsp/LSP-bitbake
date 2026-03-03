"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitBakeProjectScannerClient = exports.BitBakeProjectScannerClient = void 0;
const BitbakeScanResult_1 = require("./lib/src/types/BitbakeScanResult");
const OutputLogger_1 = require("./lib/src/utils/OutputLogger");
/// Keeps track of the bitbake scan results from the language server
class BitBakeProjectScannerClient {
    constructor() {
        this.bitbakeScanResult = {
            _layers: [],
            _classes: [],
            _includes: [],
            _recipes: [],
            _overrides: [],
            _confFiles: [],
            _workspaces: [],
            _bitbakeVersion: ''
        };
    }
    setScanResults(scanResults) {
        OutputLogger_1.logger.info('Project scan results received');
        // In case a parsing error occurred, we keep the previous results such that the relevant language features can still work
        if (!(0, BitbakeScanResult_1.scanContainsRecipes)(this.bitbakeScanResult) || (0, BitbakeScanResult_1.scanContainsRecipes)(scanResults)) {
            this.bitbakeScanResult = scanResults;
        }
    }
}
exports.BitBakeProjectScannerClient = BitBakeProjectScannerClient;
exports.bitBakeProjectScannerClient = new BitBakeProjectScannerClient();
//# sourceMappingURL=BitbakeProjectScannerClient.js.map