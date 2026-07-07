const { expect } = require("chai");
const sinon = require("sinon");
const { UserFeedback } = require("../../src/utils/user-feedback");
const packageJson = require("../../package.json");

describe(`${UserFeedback.name}`, () => {
  let sandbox;
  let mockContext;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockContext = {
      app: {
        alert: sinon.stub(),
      },
    };
    sandbox.stub(console, "error");
    sandbox.stub(console, "warn");
    sandbox.stub(console, "log");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(`${UserFeedback.showUnexpectedError.name}()`, () => {
    [
      ["some error", "some error"],
      [undefined, "Unknown error"],
    ].forEach(([errorMessage, expectedMessage]) => {
      it(`shows alert with message: "${expectedMessage}"`, () => {
        const error = new Error(errorMessage);
        const title = "some title";

        UserFeedback.showUnexpectedError(mockContext, title, error);

        expect(mockContext.app.alert.calledOnce).to.be.true;
        expect(mockContext.app.alert.firstCall.args[0]).to.equal(title);
        expect(mockContext.app.alert.firstCall.args[1]).to.equal(expectedMessage);
      });
    });
  });

  describe(`${UserFeedback.showValidationErrors.name}()`, () => {
    it("shows alert containing errors, warnings and missing files", () => {
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

      expect(mockContext.app.alert.calledOnce).to.be.true;
      expect(mockContext.app.alert.firstCall.args[0]).to.equal(title);
      const message = mockContext.app.alert.firstCall.args[1];
      expect(message).to.include(errorMessage);
      expect(message).to.include(warningMessage);
      expect(message).to.include(missingFileKey);
      expect(message).to.include(missingFilePath);
    });
  });

  describe(`${UserFeedback.showAlert.name}() via window.showAlert`, () => {
    beforeEach(() => {
      // simulate Insomnia renderer environment where window.showAlert is defined
      global.window = { showAlert: sinon.stub() };
    });

    afterEach(() => {
      delete global.window;
    });

    it("calls window.showAlert with force-pre-wrap bodyClassName", () => {
      UserFeedback.showAlert(mockContext, "title", "line1\nline2");

      expect(global.window.showAlert.calledOnce).to.be.true;
      expect(global.window.showAlert.firstCall.args[0]).to.deep.equal({
        title: "title",
        message: "line1\nline2",
        bodyClassName: "force-pre-wrap",
      });
      expect(mockContext.app.alert.called).to.be.false;
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
