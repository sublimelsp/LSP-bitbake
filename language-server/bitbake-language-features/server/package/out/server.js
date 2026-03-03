#!/usr/bin/env node
"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Eugen Wiens. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const path_1 = __importDefault(require("path"));
const node_1 = require("vscode-languageserver/node");
const BitBakeDocScanner_1 = require("./BitBakeDocScanner");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const analyzer_1 = require("./tree-sitter/analyzer");
const parser_1 = require("./tree-sitter/parser");
const OutputLogger_1 = require("./lib/src/utils/OutputLogger");
const onCompletion_1 = require("./connectionHandlers/onCompletion");
const onDefinition_1 = require("./connectionHandlers/onDefinition");
const onHover_1 = require("./connectionHandlers/onHover");
const general_support_1 = require("./embedded-languages/general-support");
const semanticTokens_1 = require("./semanticTokens");
const BitbakeProjectScannerClient_1 = require("./BitbakeProjectScannerClient");
const requests_1 = require("./lib/src/types/requests");
const notifications_1 = require("./lib/src/types/notifications");
const BitbakeSettings_1 = require("./lib/src/BitbakeSettings");
const onReference_1 = require("./connectionHandlers/onReference");
const onRename_1 = require("./connectionHandlers/onRename");
// Create a connection for the server. The connection uses Node's IPC as a transport
exports.connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
(0, onDefinition_1.setDefinitionsConnection)(exports.connection);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
let workspaceFolder;
let pokyFolder;
const disposables = [];
let currentActiveTextDocument = vscode_languageserver_textdocument_1.TextDocument.create('file://dummy_uri', 'bitbake', 0, '');
disposables.push(exports.connection.onInitialize(async (params) => {
    OutputLogger_1.logger.level = 'none';
    OutputLogger_1.logger.info('[onInitialize] Initializing connection');
    workspaceFolder = params.workspaceFolders?.[0].uri.replace('file://', '');
    pokyFolder = pokyFolder ?? workspaceFolder;
    OutputLogger_1.logger.info('[onInitialize] Parsing doc files');
    BitBakeDocScanner_1.bitBakeDocScanner.parseDocs();
    const bitBakeParser = await (0, parser_1.generateBitBakeParser)();
    const bashParser = await (0, parser_1.generateBashParser)();
    analyzer_1.analyzer.initialize(bitBakeParser, bashParser);
    return {
        capabilities: {
            workspace: {
                fileOperations: {
                    didCreate: {
                        filters: [
                            {
                                pattern: { glob: '**/*' },
                                scheme: 'file'
                            }
                        ]
                    },
                    didDelete: {
                        filters: [
                            {
                                pattern: { glob: '**/*' },
                                scheme: 'file'
                            }
                        ]
                    },
                    didRename: {
                        filters: [
                            {
                                pattern: { glob: '**/*' },
                                scheme: 'file'
                            }
                        ]
                    }
                }
            },
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: [':', '[']
            },
            definitionProvider: true,
            referencesProvider: true,
            hoverProvider: true,
            semanticTokensProvider: {
                legend: semanticTokens_1.legend,
                full: true
            },
            renameProvider: {
                prepareProvider: true
            }
        }
    };
}), exports.connection.onDidChangeConfiguration((change) => {
    OutputLogger_1.logger.level = change.settings.bitbake?.loggingLevel ?? OutputLogger_1.logger.level;
    const bitbakeFolder = (0, BitbakeSettings_1.expandSettingPath)(change.settings.bitbake?.pathToBitbakeFolder, { workspaceFolder });
    if (bitbakeFolder !== undefined) {
        pokyFolder = path_1.default.join(bitbakeFolder, '..'); // We assume BitBake is into Poky
    }
}), exports.connection.onCompletion(onCompletion_1.onCompletionHandler), exports.connection.onCompletionResolve(onCompletion_1.onCompletionResolveHandler), exports.connection.onDefinition(onDefinition_1.onDefinitionHandler), exports.connection.onReferences(onReference_1.onReferenceHandler), exports.connection.onHover(onHover_1.onHoverHandler), exports.connection.onRenameRequest(onRename_1.onRenameRequestHandler), exports.connection.onPrepareRename(onRename_1.onPrepareRenameHandler), exports.connection.workspace.onDidCreateFiles((event) => {
    OutputLogger_1.logger.debug(`[onDidCreateFiles] ${JSON.stringify(event)}`);
    analyzer_1.analyzer.clearRecipeLocalFiles();
}), exports.connection.workspace.onDidDeleteFiles((event) => {
    OutputLogger_1.logger.debug(`[onDidDeleteFiles] ${JSON.stringify(event)}`);
    analyzer_1.analyzer.clearRecipeLocalFiles();
}), exports.connection.workspace.onDidRenameFiles((event) => {
    OutputLogger_1.logger.debug(`[onDidRenameFiles] ${JSON.stringify(event)}`);
    analyzer_1.analyzer.clearRecipeLocalFiles();
}), exports.connection.onRequest(requests_1.RequestMethod.EmbeddedLanguageTypeOnPosition, async ({ uriString, position }) => {
    return (0, general_support_1.getEmbeddedLanguageTypeOnPosition)(uriString, position);
}), 
// Reference: https://github.com/microsoft/vscode-languageserver-node/blob/ed3cd0f78c1495913bda7318ace2be7f968008af/protocol/src/common/protocol.semanticTokens.ts#L61
exports.connection.onRequest(node_1.SemanticTokensRequest.method, ({ textDocument }) => {
    OutputLogger_1.logger.debug(`[OnRequest] <${node_1.SemanticTokensRequest.method}> Document uri: ${textDocument.uri}`);
    return (0, semanticTokens_1.getSemanticTokens)(textDocument.uri);
}), exports.connection.onRequest(requests_1.RequestMethod.getLinksInDocument, (params) => {
    return analyzer_1.analyzer.getLinksInStringContent(params.documentUri);
}), exports.connection.onRequest(requests_1.RequestMethod.ProcessRecipeScanResults, (param) => {
    OutputLogger_1.logger.debug(`[onRequest] <ProcessRecipeScanResults> uri:  ${JSON.stringify(param.uri)} recipe: ${param.chosenRecipe}`);
    analyzer_1.analyzer.processRecipeScanResults(param.scanResults, param.chosenRecipe);
}), exports.connection.onRequest(requests_1.RequestMethod.ProcessGlobalEnvScanResults, (param) => {
    OutputLogger_1.logger.debug('[onRequest] <ProcessGlobalEnvScanResults>');
    analyzer_1.analyzer.processGlobalEnvScanResults(param.scanResults);
}), exports.connection.onRequest(requests_1.RequestMethod.getVar, async (params) => {
    const scanResult = analyzer_1.analyzer.getRecipeLastScanResult(params.recipe);
    return scanResult?.symbols.find(symbolInfo => symbolInfo.name === params.variable)?.finalValue;
}), exports.connection.onNotification(notifications_1.NotificationMethod.RemoveScanResult, (param) => {
    OutputLogger_1.logger.debug(`[onNotification] <${notifications_1.NotificationMethod.RemoveScanResult}> recipe: ${param.recipeName}`);
    analyzer_1.analyzer.removeLastScanResultForRecipe(param.recipeName);
}), exports.connection.onNotification(notifications_1.NotificationMethod.ScanComplete, (scanResults) => {
    BitbakeProjectScannerClient_1.bitBakeProjectScannerClient.setScanResults(scanResults);
    OutputLogger_1.logger.debug('Analyzing the current document again...');
    analyzer_1.analyzer.analyze({ document: currentActiveTextDocument, uri: currentActiveTextDocument.uri });
}), exports.connection.onShutdown(() => {
    disposables.forEach((disposable) => { disposable.dispose(); });
}), documents.onDidOpen(analyzeDocument), documents.onDidChangeContent(async (event) => {
    await analyzeDocument(event);
    if (analyzer_1.analyzer.getRecipeLocalFiles(event.document.uri) === undefined) {
        try {
            const recipeLocalFiles = await exports.connection.sendRequest(requests_1.RequestMethod.getRecipeLocalFiles, { uri: event.document.uri.replace('file://', '') });
            analyzer_1.analyzer.setRecipeLocalFiles(event.document.uri, recipeLocalFiles);
        }
        catch (error) {
            // When using the language server without the client, custom requests are not supported
            // The CoC.nvim client will disable the server if an exception is thrown
            OutputLogger_1.logger.error(`Error while getting recipe local files: ${error}`);
        }
    }
}));
exports.connection.listen();
documents.listen(exports.connection);
async function analyzeDocument(event) {
    const textDocument = event.document;
    const previousVersion = analyzer_1.analyzer.getAnalyzedDocument(textDocument.uri)?.version ?? -1;
    if (textDocument.getText().length > 0 && previousVersion < textDocument.version) {
        const diagnostics = analyzer_1.analyzer.analyze({ document: textDocument, uri: textDocument.uri });
        const embeddedLanguageDocs = (0, general_support_1.generateEmbeddedLanguageDocs)(event.document, pokyFolder);
        if (embeddedLanguageDocs !== undefined) {
            void exports.connection.sendNotification(notifications_1.NotificationMethod.EmbeddedLanguageDocs, embeddedLanguageDocs);
        }
        void exports.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }
    currentActiveTextDocument = textDocument;
}
//# sourceMappingURL=server.js.map