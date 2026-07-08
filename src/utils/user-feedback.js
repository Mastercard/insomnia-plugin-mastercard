const prefix = require('../../package.json').name;

class UserFeedback {

    static showUnexpectedError(context, title, error) {
        const message = error.message || "Unknown error";
        UserFeedback.showAlert(context, title, message);
    }

    static showValidationErrors(context, title, { missingFiles, errors, warnings }) {
        const lines = [];

        if (errors && errors.length) {
            lines.push('Errors:');
            errors.forEach(e => lines.push(`  • ${e.message}`));
        }

        if (missingFiles && missingFiles.length) {
            missingFiles.forEach(([key, path]) => lines.push(`  • No file found for entry ${key}: ${path}`));
        }

        if (warnings && warnings.length) {
            lines.push('Warnings:');
            warnings.forEach(w => lines.push(`  • ${w.message}`));
        }

        UserFeedback.showAlert(context, title, lines.join('\n'));
    }

    static showAlert(context, title, message) {
        if (typeof window !== 'undefined' && typeof window.showAlert === 'function') {
            window.showAlert({ title, message, bodyClassName: 'force-pre-wrap' });
        } else {
            context.app.alert(title, message);
        }
    }

    static logError(message, error) {
        // eslint-disable-next-line no-console
        console.error(`${prefix}: ${message}`, error);
    }

    static logWarning(message) {
        // eslint-disable-next-line no-console
        console.warn(`${prefix}: ${message}`);
    }

    static logMessage(message) {
        // eslint-disable-next-line no-console
        console.log(`${prefix}: ${message}`);
    }
}

module.exports.UserFeedback = UserFeedback;