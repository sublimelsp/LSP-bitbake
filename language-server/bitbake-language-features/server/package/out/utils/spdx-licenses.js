"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpdxLicenseDetails = exports.getSpdxLicense = exports.getSpdxLicenses = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default();
const loadSpdxLicenses = async () => {
    OutputLogger_1.logger.debug('[loadSpdxLicenses] Load SPDX licenses');
    return await new Promise((resolve) => {
        const spdxLicensesPath = path_1.default.join(__dirname, '../../resources/spdx-licenses.json');
        fs_1.default.readFile(spdxLicensesPath, (error, data) => {
            if (error !== null) {
                OutputLogger_1.logger.error(`[loadSpdxLicenses] error: ${JSON.stringify(error)}`);
                resolve([]);
            }
            const spdxLicensesCollection = JSON.parse(data.toString());
            resolve(spdxLicensesCollection.licenses);
        });
    });
};
const getSpdxLicenses = async () => {
    OutputLogger_1.logger.debug('[getSpdxLicenses] Get SPDX licenses');
    const cacheKey = 'spdxLicenses';
    // node-cache will eventually release the memory, compared to a simple global variable.
    const cachedSpdxLicenses = cache.get(cacheKey);
    if (cachedSpdxLicenses !== undefined) {
        return cachedSpdxLicenses;
    }
    const spdxLicenses = await loadSpdxLicenses();
    cache.set(cacheKey, spdxLicenses);
    return spdxLicenses;
};
exports.getSpdxLicenses = getSpdxLicenses;
const getSpdxLicense = async (licenseId) => {
    OutputLogger_1.logger.debug(`[getSpdxLicense] Get SPDX license for ${licenseId}`);
    const spdxLicenses = await (0, exports.getSpdxLicenses)();
    return spdxLicenses.find((license) => license.licenseId === licenseId);
};
exports.getSpdxLicense = getSpdxLicense;
const getSpdxLicenseDetails = async (license) => {
    OutputLogger_1.logger.debug('[getSpdxLicenseDetails] Get SPDX licenses details');
    const cachedDetails = cache.get(license.detailsUrl);
    if (cachedDetails !== undefined) {
        return cachedDetails;
    }
    OutputLogger_1.logger.debug('[getSpdxLicenseDetails] Fetch SPDX licenses details');
    const detailsResponse = await fetch(license.detailsUrl);
    const spdxLicenseDetails = await detailsResponse.json();
    cache.set(license.detailsUrl, spdxLicenseDetails);
    return spdxLicenseDetails;
};
exports.getSpdxLicenseDetails = getSpdxLicenseDetails;
//# sourceMappingURL=spdx-licenses.js.map