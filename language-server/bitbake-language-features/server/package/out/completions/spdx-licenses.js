"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpdxLicenseCompletionResolve = exports.getLicenseCompletionItems = exports.licenseOperators = exports.spdxLicenseDescription = void 0;
const node_1 = require("vscode-languageserver/node");
const OutputLogger_1 = require("../lib/src/utils/OutputLogger");
const textDocument_1 = require("../utils/textDocument");
const spdx_licenses_1 = require("../utils/spdx-licenses");
exports.spdxLicenseDescription = 'Source: SPDX License List';
exports.licenseOperators = [
    {
        label: '&',
        kind: node_1.CompletionItemKind.Operator,
        insertText: '& '
    },
    {
        label: '|',
        kind: node_1.CompletionItemKind.Operator,
        insertText: '| '
    }
];
const getLicenseCompletionItems = async (textDocument, position) => {
    const previousCharacters = (0, textDocument_1.getPreviousCharactersOnLine)(textDocument, position);
    if (previousCharacters.at(-1) === ' ' &&
        !'&|'.includes(previousCharacters.at(-2))) {
        return exports.licenseOperators;
    }
    const rangeOfText = (0, textDocument_1.getRangeOfWord)(textDocument, position);
    const spdxLicenses = await (0, spdx_licenses_1.getSpdxLicenses)();
    return spdxLicenses.map((license) => ({
        label: license.licenseId,
        kind: node_1.CompletionItemKind.Value,
        deprecated: license.isDeprecatedLicenseId === true,
        labelDetails: {
            description: exports.spdxLicenseDescription
        },
        documentation: 'Loading...',
        textEdit: {
            range: rangeOfText,
            newText: license.licenseId
        },
        data: {
            source: exports.spdxLicenseDescription,
            payload: license
        }
    }));
};
exports.getLicenseCompletionItems = getLicenseCompletionItems;
const getSpdxLicenseCompletionResolve = async (item) => {
    try {
        const license = item.data.payload;
        const spdxLicenseDetails = await (0, spdx_licenses_1.getSpdxLicenseDetails)(license);
        const resolvedItem = {
            ...item,
            documentation: spdxLicenseDetails.licenseText
        };
        return resolvedItem;
    }
    catch (error) {
        OutputLogger_1.logger.error(`[getSpdxLicenseCompletionResolve] error: ${error}`);
        return item;
    }
};
exports.getSpdxLicenseCompletionResolve = getSpdxLicenseCompletionResolve;
//# sourceMappingURL=spdx-licenses.js.map