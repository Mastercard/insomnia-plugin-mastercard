const prefix = require('../../package.json').name;

class UserFeedback {

    static showUnexpectedError(context, title, error) {
        const messageStr = error.message || "Unknown error";
        const message = document.createElement('p');
        message.innerHTML = messageStr;

        UserFeedback.showAlert(context, title, [message]);
    }

    static showValidationErrors(context, title, { missingFiles, errors, warnings}) {
        const elements = [];
        if(errors && errors.length) {
            const htmlFormattedErrors = errors.map(e => e.field ? e.message.replace(e.field, `<strong>${e.field}</strong>`) : e.message);
            elements.push(...UserFeedback.unorderedList('Errors', htmlFormattedErrors));
        }

        if(missingFiles && missingFiles.length) {
            const fileErrors = missingFiles.map(([key, path]) => `No file found for entry <strong>${key}: ${path}</strong>`);
            elements.push(...UserFeedback.unorderedList(null, fileErrors));
        }

        if(warnings && warnings.length) {
            const htmlFormattedWarnings = warnings.map(w => w.field ? w.message.replace(w.field, `<strong>${w.field}</strong>`): w.message);
            elements.push(...UserFeedback.unorderedList('Warnings', htmlFormattedWarnings));
        }

        UserFeedback.showAlert(context, title, elements);
    };

    static showAlert(context, title, content) {
        const body = document.createElement('div');
        content.forEach(e => body.appendChild(e));

        context.app.dialog(title, body);
    }

    static unorderedList(headingText, listItems) {
        const ul = document.createElement('ul');
        ul.style.listStyleType = "disc";
        ul.style.paddingLeft = "20px";
        listItems.forEach(it => {
                const li = document.createElement("li");
                li.innerHTML = it;
                ul.appendChild(li);
         });

         if(headingText) {
            const heading = document.createElement("h4");
            heading.textContent = headingText;
            heading.style.fontSize = "1.2em"; 
            heading.style.fontWeight = "bold";

            return [heading, ul];
         }

         return [ul];
    }

    static logError(message, error) {
        // eslint-disable-next-line no-console
        console.error(`${prefix}: ${message}`, error);
    };

    static logWarning(message) {
        // eslint-disable-next-line no-console
        console.warn(`${prefix}: ${message}`);
    };

    static logMessage(message) {
        // eslint-disable-next-line no-console
        console.log(`${prefix}: ${message}`);
    }
}

module.exports.UserFeedback = UserFeedback;