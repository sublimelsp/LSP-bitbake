import type * as LSP from 'vscode-languageserver/node';
export declare function onRenameRequestHandler(renameParams: LSP.RenameParams): LSP.WorkspaceEdit | undefined | null;
export declare function onPrepareRenameHandler(onPrepareRenameParams: LSP.PrepareRenameParams): LSP.PrepareRenameResult | undefined | null;
