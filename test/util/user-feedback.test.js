const { expect } = require("chai");
const sinon = require("sinon");
const { UserFeedback } = require("../../src/utils/user-feedback");
const packageJson = require("../../package.json");
const { JSDOM } = require("jsdom");

describe(`${UserFeedback.name}`, () => {
  const originalDocument = global.document;
  const originalHeadingElement = global.HTMLHeadingElement;
  const originalUListElement = global.HTMLUListElement;
  let sandbox;
  let mockDocument;
  let mockContext;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    mockDocument = dom.window.document;

    global.document = mockDocument;
    global.HTMLHeadingElement = dom.window.HTMLHeadingElement;
    global.HTMLUListElement = dom.window.HTMLUListElement;

    mockContext = {
      app: {
        dialog: sinon.stub(),
      },
    };

    sandbox.stub(console, "error");
    sandbox.stub(console, "warn");
    sandbox.stub(console, "log");
  });

  afterEach(() => {
    sandbox.restore();
    global.document = originalDocument;
    global.HTMLHeadingElement = originalHeadingElement;
    global.HTMLUListElement = originalUListElement;
  });

  describe(`${UserFeedback.showUnexpectedError.name}()`, () => {
    [
      ["some error", "some error"],
      [undefined, "Unknown error"],
    ].forEach(([errorMessage, expectedMessage]) => {
      it("shows dialog with error message as expected", () => {
        const error = new Error(errorMessage);
        const title = "some title";

        UserFeedback.showUnexpectedError(mockContext, title, error);

        expect(mockContext.app.dialog.calledOnce).to.be.true;
        expect(mockContext.app.dialog.firstCall.args[0]).to.equal(title);
        expect(mockContext.app.dialog.firstCall.args[1].textContent).to.equal(expectedMessage);
      });
    });
  });

  describe(`${UserFeedback.showValidationErrors.name}()`, () => {
    it("shows dialog with errors, warnings and missing files as expected", () => {
      const title = "some title";
      const errorMessage = "error-message";
      const warningMessage = "warning-message";
      const missingFileKey = "missing-file-key";
      const missingFilePath = "missing-file-path";

      UserFeedback.showValidationErrors(mockContext, title, {
        errors: [{ field: "error-field", message: errorMessage }],
        warnings: [{ field: "warning-field", message: warningMessage }],
        missingFiles: [[missingFileKey, missingFilePath]],
      });

      expect(mockContext.app.dialog.calledOnce).to.be.true;
      expect(mockContext.app.dialog.firstCall.args[0]).to.equal(title);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(errorMessage);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(warningMessage);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(missingFileKey);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(missingFilePath);
    });

    it("shows dialog with errors, warnings and missing files as expected", () => {
      const title = "some title";
      const errorMessage = "error-message";
      const warningMessage = "warning-message";
      const missingFileKey = "missing-file-key";
      const missingFilePath = "missing-file-path";

      UserFeedback.showValidationErrors(mockContext, title, {
        errors: [{ field: "error-field", message: errorMessage }],
        warnings: [{ field: "warning-field", message: warningMessage }],
        missingFiles: [[missingFileKey, missingFilePath]],
      });

      expect(mockContext.app.dialog.calledOnce).to.be.true;
      expect(mockContext.app.dialog.firstCall.args[0]).to.equal(title);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(errorMessage);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(warningMessage);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(missingFileKey);
      expect(mockContext.app.dialog.firstCall.args[1].textContent).to.include(missingFilePath);
    });
  });

  describe(`${UserFeedback.unorderedList.name}()`, () => {
    it("returns heading and ul as expected", () => {
      const [heading, ul] = UserFeedback.unorderedList("the-heading", ["item1", "item2"]);

      expect(heading).instanceOf(HTMLHeadingElement);
      expect(heading.textContent).to.equal("the-heading");

      expect(ul).instanceOf(HTMLUListElement);
      const ulContent = Array.from(ul.children).map((li) => li.textContent);
      expect(ulContent).to.deep.equal(["item1", "item2"]);
    });

    it("does not return heading element if heading is empty", () => {
      const response = UserFeedback.unorderedList(null, ["item1, item2"]);

      expect(response).to.have.length(1);
      expect(response[0]).instanceOf(HTMLUListElement);
    });
  });

  describe("logging methods", () => {
    it("should log error with prefix", () => {
      const message = "Test error";
      const error = new Error("Error object");

      UserFeedback.logError(message, error);

      expect(console.error.calledWith(`${packageJson.name}: ${message}`, error)).to.be.true;
    });

    it("should log warning with prefix", () => {
      const message = "Test warning";

      UserFeedback.logWarning(message);

      expect(console.warn.calledWith(`${packageJson.name}: ${message}`)).to.be.true;
    });

    it("should log message with prefix", () => {
      const message = "Test message";

      UserFeedback.logMessage(message);

      expect(console.log.calledWith(`${packageJson.name}: ${message}`)).to.be.true;
    });
  });
});
