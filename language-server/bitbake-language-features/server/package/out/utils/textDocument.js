"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeOfWord = exports.getPreviousCharactersOnLine = exports.getLine = void 0;
const getLine = (document, lineNumber) => {
    const range = {
        start: {
            line: lineNumber,
            character: 0
        },
        end: {
            line: lineNumber + 1,
            character: 0
        }
    };
    return document.getText(range);
};
exports.getLine = getLine;
const getPreviousCharactersOnLine = (document, position) => {
    const range = {
        start: {
            line: position.line,
            character: 0
        },
        end: position
    };
    return document.getText(range);
};
exports.getPreviousCharactersOnLine = getPreviousCharactersOnLine;
const getRangeOfWord = (document, position, boundRegex = /\s|'|"/) => {
    const line = (0, exports.getLine)(document, position.line);
    const baseIndex = position.character;
    let startIndex = baseIndex;
    while (startIndex > 0 && !boundRegex.test(line[startIndex - 1])) {
        startIndex--;
    }
    let endIndex = baseIndex;
    while (endIndex < line.length && !boundRegex.test(line[endIndex])) {
        endIndex++;
    }
    return {
        start: {
            line: position.line,
            character: startIndex
        },
        end: {
            line: position.line,
            character: endIndex
        }
    };
};
exports.getRangeOfWord = getRangeOfWord;
//# sourceMappingURL=textDocument.js.map