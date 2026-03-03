"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2023 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.OutputLogger = void 0;
class OutputLogger {
    constructor() {
        // default value in package.json
        this.level = '';
        this.rateLimitStart = 0;
        this.rateLimitCount = 0;
    }
    static getInstance() {
        if (OutputLogger.instance === undefined) {
            OutputLogger.instance = new OutputLogger();
        }
        return OutputLogger.instance;
    }
    log(message, level = 'info') {
        if (this.shouldLog(level)) {
            this.outputChannel?.appendLine(message);
            const time = new Date().toISOString().substring(11, 23);
            console.log(`${time} [${level[0].toUpperCase() + level.slice(1)}] ${message}`);
        }
    }
    info(message) {
        this.log(message);
    }
    debug(message) {
        this.log(message, 'debug');
    }
    debug_ratelimit(message) {
        if (!this.shouldLog(this.level)) {
            // OPTIM Skip the regex check if the log level is not high enough
            return;
        }
        if (OutputLogger.rateLimitPatterns.test(message)) {
            const now = Date.now();
            if (now - this.rateLimitStart < OutputLogger.rateLimit) {
                this.rateLimitCount++;
                return;
            }
            this.rateLimitStart = now;
            if (this.rateLimitCount > 0) {
                this.debug(`Rate limited ${this.rateLimitCount} messages`);
                this.rateLimitCount = 0;
            }
        }
        this.debug(message);
    }
    warn(message) {
        this.log(message, 'warning');
    }
    error(message) {
        this.log(message, 'error');
    }
    clear() {
        console.clear();
        this.outputChannel?.clear();
    }
    shouldLog(level) {
        // Determine if the log level should be printed
        const logLevels = ['none', 'error', 'warning', 'info', 'debug'];
        const currentLevelIndex = logLevels.indexOf(this.level);
        const messageLevelIndex = logLevels.indexOf(level);
        return currentLevelIndex >= messageLevelIndex;
    }
}
exports.OutputLogger = OutputLogger;
/* Catches messages like:
 *   0: busybox-1.37.0-r0 do_fetch - 6s (pid 280)   7% |#########       | 28.7M/s
 *   Parsing recipes:  10% |################                            | ETA:  0:00:19
 *   No currently running tasks (0 of 3)   0% |                         |
 */
OutputLogger.rateLimitPatterns = /% \|/;
OutputLogger.rateLimit = 1000;
// Create and export the singleton logger instance
exports.logger = OutputLogger.getInstance();
//# sourceMappingURL=OutputLogger.js.map