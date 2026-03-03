import { type BitbakeScanResult } from './lib/src/types/BitbakeScanResult';
export declare class BitBakeProjectScannerClient {
    bitbakeScanResult: BitbakeScanResult;
    setScanResults(scanResults: BitbakeScanResult): void;
}
export declare const bitBakeProjectScannerClient: BitBakeProjectScannerClient;
