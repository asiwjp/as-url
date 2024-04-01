import { URL } from "../src/URL"

describe("URL", () => {
    describe("constructor", () => {
        it("valid. with all its components. https://username:password@host:80/pathname?search#hash", () => {
            const uri = "https://username:password@host:80/pathname?search#hash";
            const actual = new URL(uri);

            expect(actual.isValid).toBeTruthy();
            expect(actual.href).toStrictEqual(uri);
            expect(actual.protocol).toStrictEqual("https:");
            expect(actual.origin).toStrictEqual("https://host:80");
            expect(actual.username).toStrictEqual("username");
            expect(actual.password).toStrictEqual("password");
            expect(actual.host).toStrictEqual("host:80");
            expect(actual.hostname).toStrictEqual("host");
            expect(actual.port).toStrictEqual("80");
            expect(actual.pathname).toStrictEqual("/pathname");
            expect(actual.search).toStrictEqual("?search");
            expect(actual.hash).toStrictEqual("#hash");
        })

        it("valid. simple url. https://host", () => {
            const uri = "https://host";
            const actual = new URL(uri);

            expect(actual.isValid).toBeTruthy();
            expect(actual.href).toStrictEqual(uri);
            expect(actual.protocol).toStrictEqual("https:");
            expect(actual.origin).toStrictEqual("https://host");
            expect(actual.username).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("host");
            expect(actual.hostname).toStrictEqual("host");
            expect(actual.port).toStrictEqual("");
            expect(actual.pathname).toStrictEqual("/");
            expect(actual.search).toStrictEqual("");
            expect(actual.hash).toStrictEqual("");
        })

        it("valid. urn. mailto:local@domain", () => {
            const uri = "mailto:local@domain";
            const actual = new URL(uri);

            expect(actual.isValid).toBeTruthy();
            expect(actual.href).toStrictEqual(uri);
            expect(actual.protocol).toStrictEqual("mailto:");
            expect(actual.origin).toStrictEqual("");
            expect(actual.username).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("");
            expect(actual.hostname).toStrictEqual("");
            expect(actual.port).toStrictEqual("");
            expect(actual.pathname).toStrictEqual("local@domain");
            expect(actual.search).toStrictEqual("");
            expect(actual.hash).toStrictEqual("");
        })

        it("invalid", () => {
            const url = "";
            const actual = new URL(url);

            expect(actual.isValid).toBeFalsy();
            expect(actual.href).toStrictEqual("");
            expect(actual.protocol).toStrictEqual("");
            expect(actual.origin).toStrictEqual("");
            expect(actual.username).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("");
            expect(actual.hostname).toStrictEqual("");
            expect(actual.port).toStrictEqual("");
            expect(actual.pathname).toStrictEqual("");
            expect(actual.search).toStrictEqual("");
            expect(actual.hash).toStrictEqual("");
        })
    })

    describe("constructor, with base", () => {
        it("valid. url=/path?search#hash, base=https://username:password@host:80", () => {
            const url = "/path?search#hash";
            const base = "https://username:password@host:80"

            expect(() => { new URL(url, base) }).toThrow();
        })
    })
})