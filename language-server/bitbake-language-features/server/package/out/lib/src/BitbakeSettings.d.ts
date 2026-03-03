export interface BitbakeBuildConfigSettings {
    pathToBuildFolder?: string;
    pathToEnvScript?: string;
    commandWrapper?: string;
    workingDirectory?: string;
    shellEnv?: NodeJS.Dict<string>;
    sshTarget?: string;
    sdkImage?: string;
    name?: string;
    disableDevtoolDebugBuild?: boolean;
}
export interface BitbakeSettings extends BitbakeBuildConfigSettings {
    pathToBitbakeFolder: string;
    buildConfigurations?: BitbakeBuildConfigSettings[];
}
export declare function loadBitbakeSettings(settings: Record<string, unknown>, workspaceFolder: string): BitbakeSettings;
export declare function expandSettingPath(configurationPath: unknown, variables: NodeJS.Dict<string>): string | undefined;
export declare function sanitizeForShell(command: string | undefined): string | undefined;
export declare function getBuildSetting(settings: BitbakeSettings, buildConfiguration: string, property: keyof BitbakeBuildConfigSettings): string | NodeJS.Dict<string> | boolean | undefined;
