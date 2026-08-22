import { describe, expect, it } from "vitest";
import {
  accountPageToSearchParams,
  parseAccountPageFromSearch,
  type AccountPage,
} from "./account-page";

describe("parseAccountPageFromSearch", () => {
  it("returns home for an empty search string", () => {
    expect(parseAccountPageFromSearch("")).toEqual({ type: "home" });
  });

  it("returns home for a search string with no fc_page param", () => {
    expect(parseAccountPageFromSearch("?other=1")).toEqual({ type: "home" });
  });

  it("parses the profile page", () => {
    expect(parseAccountPageFromSearch("?fc_page=profile")).toEqual({
      type: "profile",
    });
  });

  it("parses the password page", () => {
    expect(parseAccountPageFromSearch("?fc_page=password")).toEqual({
      type: "password",
    });
  });

  it("parses a subscription page with an id", () => {
    expect(
      parseAccountPageFromSearch("?fc_page=subscription&fc_id=42"),
    ).toEqual({ type: "subscription", id: "42" });
  });

  it("parses an order page with an id", () => {
    expect(parseAccountPageFromSearch("?fc_page=order&fc_id=7")).toEqual({
      type: "order",
      id: "7",
    });
  });

  it("parses an address page with an id", () => {
    expect(parseAccountPageFromSearch("?fc_page=address&fc_id=3")).toEqual({
      type: "address",
      id: "3",
    });
  });

  it("falls back to home when a per-item page is missing fc_id", () => {
    expect(parseAccountPageFromSearch("?fc_page=subscription")).toEqual({
      type: "home",
    });
  });

  it("falls back to home when fc_id is an empty string", () => {
    expect(parseAccountPageFromSearch("?fc_page=order&fc_id=")).toEqual({
      type: "home",
    });
  });

  it("falls back to home for an unrecognized fc_page value", () => {
    expect(parseAccountPageFromSearch("?fc_page=bogus")).toEqual({
      type: "home",
    });
  });
});

describe("accountPageToSearchParams", () => {
  it("serialises home to empty params", () => {
    const page: AccountPage = { type: "home" };
    expect(accountPageToSearchParams(page).toString()).toBe("");
  });

  it("serialises profile", () => {
    const page: AccountPage = { type: "profile" };
    expect(accountPageToSearchParams(page).toString()).toBe("fc_page=profile");
  });

  it("serialises password", () => {
    const page: AccountPage = { type: "password" };
    expect(accountPageToSearchParams(page).toString()).toBe(
      "fc_page=password",
    );
  });

  it("serialises a subscription page, dropping the resource field", () => {
    const page: AccountPage = {
      type: "subscription",
      id: "42",
      resource: {} as never,
    };
    expect(accountPageToSearchParams(page).toString()).toBe(
      "fc_page=subscription&fc_id=42",
    );
  });

  it("serialises an order page", () => {
    const page: AccountPage = { type: "order", id: "7" };
    expect(accountPageToSearchParams(page).toString()).toBe(
      "fc_page=order&fc_id=7",
    );
  });

  it("serialises an address page", () => {
    const page: AccountPage = { type: "address", id: "3" };
    expect(accountPageToSearchParams(page).toString()).toBe(
      "fc_page=address&fc_id=3",
    );
  });

  it("round-trips every non-home page through parse and serialise", () => {
    const pages: AccountPage[] = [
      { type: "profile" },
      { type: "password" },
      { type: "subscription", id: "42" },
      { type: "order", id: "7" },
      { type: "address", id: "3" },
    ];

    for (const page of pages) {
      const search = accountPageToSearchParams(page).toString();
      expect(parseAccountPageFromSearch(`?${search}`)).toEqual(page);
    }
  });
});
