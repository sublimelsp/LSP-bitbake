"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBitbakeSettings = loadBitbakeSettings;
exports.expandSettingPath = expandSettingPath;
exports.sanitizeForShell = sanitizeForShell;
exports.getBuildSetting = getBuildSetting;
function loadBitbakeSettings(settings, workspaceFolder) {
    // The default values are defined in package.json
    // Change the working directory to properly handle relative paths in the language client
    try {
        process.chdir(workspaceFolder);
    }
    catch (err) {
        console.error(`chdir: $settings.${err}`);
    }
    const variables = {
        workspaceFolder,
        ...Object.fromEntries(Object.entries(process.env).map(([key, value]) => [`env:${key}`, value]))
    };
    const expandedSettings = {
        ...expandBuildConfig(settings, variables),
        pathToBitbakeFolder: expandSettingPath(settings.pathToBitbakeFolder, variables) ?? workspaceFolder,
        buildConfigurations: expandBuildConfigsSettings(settings.buildConfigurations, variables)
    };
    expandedSettings.workingDirectory = expandedSettings.workingDirectory ?? workspaceFolder;
    return expandedSettings;
}
function expandSettingPath(configurationPath, variables) {
    if (typeof configurationPath !== 'string' || configurationPath === '' || configurationPath === undefined) {
        return undefined;
    }
    return expandSettingString(configurationPath, variables);
}
function expandSettingString(configurationPath, variables) {
    if (typeof configurationPath !== 'string' || configurationPath === '' || configurationPath === undefined) {
        return undefined;
    }
    return sanitizeForShell(substituteVariables(configurationPath, variables));
}
/// Substitute ${variables} in a string
function substituteVariables(configuration, variables) {
    // Reproduces the behavior of https://code.visualstudio.com/docs/editor/variables-reference
    // VSCode should be doing this for us, has been requested for years: https://github.com/microsoft/vscode/issues/2809
    return configuration.replace(/\${(.*?)}/g, (_, name) => {
        return variables[name] ?? '';
    });
}
function expandStringDict(dict, variables) {
    return (dict != null) ? Object.fromEntries(Object.entries(dict).map(([key, value]) => [key, expandSettingString(value, variables)])) : undefined;
}
/// Santitize a string to be passed in a shell command (remove special characters)
function sanitizeForShell(command) {
    if (command === undefined) {
        return undefined;
    }
    return command.replace(/[;`&|<>\\$(){}!#*?"']/g, '');
}
function toStringDict(dict) {
    return dict;
}
function expandBuildConfigsSettings(buildConfigurations, variables) {
    if (buildConfigurations === undefined || !Array.isArray(buildConfigurations)) {
        return undefined;
    }
    return buildConfigurations.map((settings) => expandBuildConfig(settings, variables));
}
function expandBuildConfig(settings, variables) {
    return {
        pathToBuildFolder: expandSettingPath(settings.pathToBuildFolder, variables),
        pathToEnvScript: expandSettingPath(settings.pathToEnvScript, variables),
        commandWrapper: expandSettingString(settings.commandWrapper, variables),
        workingDirectory: expandSettingPath(settings.workingDirectory, variables),
        shellEnv: expandStringDict(toStringDict(settings.shellEnv), variables),
        sdkImage: expandSettingString(settings.sdkImage, variables),
        sshTarget: expandSettingString(settings.sshTarget, variables),
        name: expandSettingString(settings.name, variables)
    };
}
function getBuildSetting(settings, buildConfiguration, property) {
    if (settings.buildConfigurations !== undefined) {
        const buildConfig = settings.buildConfigurations.find(config => config.name === buildConfiguration);
        if (buildConfig !== undefined) {
            return buildConfig[property] ?? settings[property];
        }
        else {
            // This mimics the BitbakeConfigPicker which always selects the first configuration if the active one is not found
            const firstConfig = settings.buildConfigurations[0];
            if (firstConfig !== undefined) {
                return firstConfig[property] ?? settings[property];
            }
        }
    }
    return settings[property];
}
//# sourceMappingURL=BitbakeSettings.js.map