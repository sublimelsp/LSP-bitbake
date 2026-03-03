export interface SpdxLicenseCollection {
    licenseListVersion: string;
    licenses: SpdxLicense[];
    releaseDate: string;
}
export interface SpdxLicense {
    reference: string;
    isDeprecatedLicenseId?: boolean;
    detailsUrl: string;
    referenceNumber?: number;
    name: string;
    licenseId: string;
    seeAlso: string[];
    isOsiApproved?: boolean;
}
export interface SpdxLicenseDetails {
    isDeprecatedLicenseId: boolean;
    licenseText: string;
    name: string;
    licenseId: string;
    crossRef: Array<{
        match: string;
        url: string;
        isValid: boolean;
        isLive: boolean;
        timestamp: string;
        isWayBackLink: boolean;
        order: number;
    }>;
    seeAlso: string[];
    isOsiApproved: boolean;
    licenseTextHtml: string;
}
export declare const getSpdxLicenses: () => Promise<SpdxLicense[]>;
export declare const getSpdxLicense: (licenseId: string) => Promise<SpdxLicense | undefined>;
export declare const getSpdxLicenseDetails: (license: SpdxLicense) => Promise<SpdxLicenseDetails>;
