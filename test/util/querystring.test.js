const { joinUrlAndQueryString, extractQueryStringFromUrl, buildQueryParameter, buildQueryStringFromParams, deconstructQueryStringToParams, smartEncodeUrl } = require("../../src/utils/insomnia-url");
const { expect } = require("chai");

describe(`QueryString test()`, () => {

  const url = () => {
    return "http://asdf.com";
  };

  const paramObj = () => {
    return {name: "fruit", value: "apple"};
  };

  const param = () => {
    return "fruit=apple";
  };

  const params = () => {
    return param() + "&color=red";
  };

  const combinedUrlParams = () => {
    return url() + "?" + params();
  };

  it("joinUrlAndQueryString returns url if qs is falsy", () => {
      const qs = null;
      const result = joinUrlAndQueryString(url(), qs);
      expect(result).to.equal(url());
  });

  it("joinUrlAndQueryString returns qs if url is falsy", () => {
    const url = null;
    const result = joinUrlAndQueryString(url, params());
    expect(result).to.equal(params());
  });

  it("joinUrlAndQueryString returns joins url and qs", () => {
    const result = joinUrlAndQueryString(url(), params());
    expect(result).to.equal(combinedUrlParams());
  });

  it("joinUrlAndQueryString returns empty string when url is falsy", () => {
    const result = extractQueryStringFromUrl(url());
    expect(result).to.equal("");
  });

  it("joinUrlAndQueryString returns empty string when url has trailing question mark", () => {
    const urlQuestionMark = url() + "?";
    const result = extractQueryStringFromUrl(urlQuestionMark);
    expect(result).to.equal("");
  });

  it("joinUrlAndQueryString returns params extracted correctly", () => {
    const result = extractQueryStringFromUrl(combinedUrlParams());
    expect(result).to.equal(params());
  });

  it("buildQueryParameter should build param correctly when strict", () => {
    const result =  buildQueryParameter(paramObj(), true);
    expect(result).to.equal(param());
  });

  it("buildQueryParameter should return empty string when no name and strict", () => {
    const paramObj = {value: "apple"};
    const result =  buildQueryParameter(paramObj, true);
    expect(result).to.equal("");
  });

  it("buildQueryParameter should handle numbers correct when strict", () => {
    const paramObj = {name: "quantity", value: 55};
    const result =  buildQueryParameter(paramObj, true);
    expect(result).to.equal("quantity=55");
  });

  it("buildQueryStringFromParams return handle multiple values correct when strict", () => {
    const paramList = [{name: "quantity", value: 55},{ name: "color", value: "red"}];
    const result =  buildQueryStringFromParams(paramList, true);
    expect(result).to.equal("quantity=55&color=red");
  });

  it("deconstructQueryStringToParams return handle multiple values correct when strict", () => {
    const paramList = "quantity=55&color=red";
    const result =  deconstructQueryStringToParams(paramList, true);
    expect(result[0].name).to.equal("quantity");
    expect(result[0].value).to.equal("55");
    expect(result[1].name).to.equal("color");
    expect(result[1].value).to.equal("red");
  });

  it("smartEncodeUrl return handle multiple values correct when strict", () => {
    const url = combinedUrlParams() + "extra=# thin*g";
    const result =  smartEncodeUrl(url, true);
    expect(result).to.equal("http://asdf.com/?fruit=apple&color=redextra%3D#%20thin*g");
  });

});
