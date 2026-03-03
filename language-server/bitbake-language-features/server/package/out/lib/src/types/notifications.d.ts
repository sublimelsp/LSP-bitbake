import { type EmbeddedLanguageDoc } from './embedded-languages';
declare enum NotificationType {
    EmbeddedLanguageDocs = "EmbeddedLanguageDocs",
    RemoveScanResult = "RemoveScanResult",
    ScanComplete = "ScanComplete"
}
export declare const NotificationMethod: Record<NotificationType, string>;
export interface NotificationParams {
    [NotificationType.EmbeddedLanguageDocs]: EmbeddedLanguageDoc[];
    [NotificationType.RemoveScanResult]: {
        recipeName: string;
    };
}
export {};
