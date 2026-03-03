"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMethod = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["EmbeddedLanguageDocs"] = "EmbeddedLanguageDocs";
    NotificationType["RemoveScanResult"] = "RemoveScanResult";
    NotificationType["ScanComplete"] = "ScanComplete";
})(NotificationType || (NotificationType = {}));
exports.NotificationMethod = {
    [NotificationType.EmbeddedLanguageDocs]: 'bitbake/EmbeddedLanguageDocs',
    [NotificationType.RemoveScanResult]: 'bitbake/removeScanResult',
    [NotificationType.ScanComplete]: 'bitbake/ScanComplete'
};
//# sourceMappingURL=notifications.js.map