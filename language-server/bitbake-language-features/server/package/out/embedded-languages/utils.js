"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTextIntoEmbeddedLanguageDoc = exports.initEmbeddedLanguageDoc = void 0;
const replaceTextForSpaces = (text) => {
    return text.replace(/[^\r\n]+/g, (match) => ' '.repeat(match.length));
};
const initCharactersOffsetArrays = (length) => {
    return Array.from({ length: length + 1 }, (_, i) => i);
};
const initEmbeddedLanguageDoc = (textDocument, language) => {
    return {
        originalUri: textDocument.uri,
        language,
        content: replaceTextForSpaces(textDocument.getText()),
        characterIndexes: initCharactersOffsetArrays(textDocument.getText().length)
    };
};
exports.initEmbeddedLanguageDoc = initEmbeddedLanguageDoc;
const addCharacterOffset = (charactersOffsetArray, character, offset) => {
    for (let i = character; i < charactersOffsetArray.length; i++) {
        charactersOffsetArray[i] += offset;
    }
};
const insertTextBetweenIndexes = (inputString, start, end, replacementText) => {
    const beforeTarget = inputString.substring(0, start);
    const afterTarget = inputString.substring(end);
    return `${beforeTarget}${replacementText}${afterTarget}`;
};
// Important constraint: Regions of the document on which the user interacts must keep the same size
// Otherwise it will not be possible to map the cursor position from the original document to the embedded document
const insertTextIntoEmbeddedLanguageDoc = (embeddedLanguageDoc, start, end, textToInsert) => {
    const adjustedStart = embeddedLanguageDoc.characterIndexes[start];
    const adjustedEnd = embeddedLanguageDoc.characterIndexes[end];
    embeddedLanguageDoc.content = insertTextBetweenIndexes(embeddedLanguageDoc.content, adjustedStart, adjustedEnd, textToInsert);
    const previousLength = end - start;
    const newLength = textToInsert.length;
    const diff = newLength - previousLength;
    if (diff !== 0) {
        addCharacterOffset(embeddedLanguageDoc.characterIndexes, end, diff);
    }
};
exports.insertTextIntoEmbeddedLanguageDoc = insertTextIntoEmbeddedLanguageDoc;
//# sourceMappingURL=utils.js.map