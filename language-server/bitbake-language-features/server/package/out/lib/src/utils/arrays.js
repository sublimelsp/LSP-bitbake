"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeArraysDistinctly = void 0;
const mergeArraysDistinctly = (getKey, // A key on which two elements are equal
...arrays) => {
    const mergedArray = [];
    const seenKeys = new Set();
    arrays.flat().forEach((item) => {
        const key = getKey(item);
        if (!seenKeys.has(key)) {
            mergedArray.push(item);
            seenKeys.add(key);
        }
    });
    return mergedArray;
};
exports.mergeArraysDistinctly = mergeArraysDistinctly;
//# sourceMappingURL=arrays.js.map