import { UriParseStateType, UriParser, UriParserConfig, UriCharType, UriParseState, InitialParseState, AuthorityBeginState, PortBeginState, PathBeginState, QueryBeginState, FragmentBeginState, ParseEndState, UserInfoBeginState, NotIpv6HostBeginState, HostBeginState, Ipv6HostBeginState } from "../src/UriParser"

const PARSER_CONFIG_DEFAULT = new UriParserConfig();

function test_getCharType(c: string, ctype: UriCharType): void {
    const actual = UriParseState.getCharType(c.codePointAt(0) || 0);
    expect(actual).toStrictEqual(ctype);
}

describe("UrlParseState", (): void => {
    it("getCharType", (): void => {
        test_getCharType("!", UriCharType.UNRESERVED_MARK);
        test_getCharType("\"", UriCharType.FORBIDDEN);
        test_getCharType("#", UriCharType.RESERVED_DELIM);
        test_getCharType("$", UriCharType.RESERVED_SUB_DELIM);
        test_getCharType("%", UriCharType.PCT_ENCODE_LETTER);
        test_getCharType("/", UriCharType.RESERVED_DELIM);
        test_getCharType("0", UriCharType.UNRESERVED_DIGIT);
        test_getCharType("9", UriCharType.UNRESERVED_DIGIT);
        test_getCharType(":", UriCharType.RESERVED_DELIM);
        test_getCharType("?", UriCharType.RESERVED_DELIM);
        test_getCharType("@", UriCharType.RESERVED_DELIM);
        test_getCharType("A", UriCharType.UNRESERVED_ALPHA);
        test_getCharType("Z", UriCharType.UNRESERVED_ALPHA);
        test_getCharType("a", UriCharType.UNRESERVED_ALPHA);
        test_getCharType("z", UriCharType.UNRESERVED_ALPHA);
        test_getCharType("~", UriCharType.UNRESERVED_MARK);
    });
})

describe("InitialParseState", (): void => {
    it("valid scheme. next is authority. http://", (): void => {
        const state = new InitialParseState(PARSER_CONFIG_DEFAULT, "http://")
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.AuthorityBegin)
        expect(actual.startIndex).toStrictEqual(7)
        expect(actual.scheme).toStrictEqual("http")
    });

    it("valid scheme. next is path", (): void => {
        const state = new InitialParseState(PARSER_CONFIG_DEFAULT, "urn:path")
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.PathBegin)
        expect(actual.startIndex).toStrictEqual(4)
        expect(actual.scheme).toStrictEqual("urn")
    });

    it("invalid scheme. empty.", (): void => {
        const state = new InitialParseState(PARSER_CONFIG_DEFAULT, ":")
        const actual = state.parse()
        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
    });

    it("invalid scheme. empty.", (): void => {
        const state = new InitialParseState(PARSER_CONFIG_DEFAULT, "")
        const actual = state.parse()
        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
    });
})

describe("AuthorityBeginState", (): void => {
    it("valid authority. if starts with userinfo. http://user:pass@", (): void => {
        const url = "http://user:pass@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new AuthorityBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.UserInfoBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });

    it("valid authority. if starts without userinfo. http://host", (): void => {
        const url = "http://host"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new AuthorityBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });

    it("valid authority. if detect /. http://host/", (): void => {
        const url = "http://host/"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new AuthorityBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });

    it("valid authority. if detect ?. http://host?", (): void => {
        const url = "http://host?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new AuthorityBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });

    it("valid authority. if detect #. http://host#", (): void => {
        const url = "http://host#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new AuthorityBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });
})

describe("UserInfoBeginState", (): void => {
    it("valid userinfo. full elements. http://user:pass@", (): void => {
        const url = "http://user:pass@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(17)
        expect(actual.user).toStrictEqual("user")
        expect(actual.password).toStrictEqual("pass")
    });

    it("valid userinfo. without pass. http://user@", (): void => {
        const url = "http://user@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(12)
        expect(actual.user).toStrictEqual("user")
        expect(actual.password).toStrictEqual("")
    });

    it("valid userinfo. empty user. http://:pass@", (): void => {
        const url = "http://:pass@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(13)
        expect(actual.user).toStrictEqual("")
        expect(actual.password).toStrictEqual("pass")
    });

    it("valid userinfo. empty pass. http://user:@", (): void => {
        const url = "http://user:@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(13)
        expect(actual.user).toStrictEqual("user")
        expect(actual.password).toStrictEqual("")
    });

    it("valid userinfo. empty with colon. http://:@", (): void => {
        const url = "http://:@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(9)
        expect(actual.user).toStrictEqual("")
        expect(actual.password).toStrictEqual("")
    });

    it("valid userinfo. empty. http://@", (): void => {
        const url = "http://@"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.HostBegin)
        expect(actual.startIndex).toStrictEqual(8)
        expect(actual.user).toStrictEqual("")
        expect(actual.password).toStrictEqual("")
    });

    it("invalid userinfo. without @. http://host", (): void => {
        const url = "http://host"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new UserInfoBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.user).toStrictEqual("")
        expect(actual.password).toStrictEqual("")
    });
})

describe("HostBeginState", (): void => {
    it("valid host. ipv6. http://[", (): void => {
        const url = "http://["
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Ipv6HostBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });

    it("valid host. not ipv6. http://host", (): void => {
        const url = "http://host"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.NotIpv6HostBegin)
        expect(actual.startIndex).toStrictEqual(7)
    });

    it("invalid host. empty. http://", (): void => {
        const url = "http://"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
    });
})

describe("Ipv6HostBeginState", (): void => {
    it("valid host(ipv6). http://[::1]", (): void => {
        const url = "http://[::1]"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.host).toStrictEqual("[::1]")
    });

    it("valid host(ipv6). next is port. http://[::1]:", (): void => {
        const url = "http://[::1]:"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.PortBegin)
        expect(actual.startIndex).toStrictEqual(12)
        expect(actual.host).toStrictEqual("[::1]")
    });

    it("valid host(ipv6). next is path. http://[::1]/", (): void => {
        const url = "http://[::1]/"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.PathBegin)
        expect(actual.startIndex).toStrictEqual(12)
        expect(actual.host).toStrictEqual("[::1]")
    });

    it("valid host(ipv6). next is query. http://[::1]?", (): void => {
        const url = "http://[::1]?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.QueryBegin)
        expect(actual.startIndex).toStrictEqual(12)
        expect(actual.host).toStrictEqual("[::1]")
    });

    it("valid host(ipv6). next is fragment. http://[::1]#", (): void => {
        const url = "http://[::1]#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.FragmentBegin)
        expect(actual.startIndex).toStrictEqual(12)
        expect(actual.host).toStrictEqual("[::1]")
    });

    it("invalid host(ipv6). too many left bracket. http://[[::1]", (): void => {
        const url = "http://[[::1]"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.host).toStrictEqual("")
    });

    it("invalid host(ipv6). right bracket missing. http://[::1", (): void => {
        const url = "http://[::1"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.host).toStrictEqual("")
    });

    it("invalid host(ipv6). empty. http://[]", (): void => {
        const url = "http://[]"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new Ipv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.host).toStrictEqual("")
    });
})

describe("NotIpv6HostBeginState", (): void => {
    it("valid host(not ipv6). next is port. http://host:", (): void => {
        const url = "http://host:1"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new NotIpv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.PortBegin)
        expect(actual.startIndex).toStrictEqual(11)
        expect(actual.host).toStrictEqual("host")
    });

    it("valid host(not ipv6). next is path. http://host/", (): void => {
        const url = "http://host/"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new NotIpv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.PathBegin)
        expect(actual.startIndex).toStrictEqual(11)
        expect(actual.host).toStrictEqual("host")
    });

    it("valid host(not ipv6). next is query. http://host?", (): void => {
        const url = "http://host?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new NotIpv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.QueryBegin)
        expect(actual.startIndex).toStrictEqual(11)
        expect(actual.host).toStrictEqual("host")
    });

    it("valid host(not ipv6). next is fragment. http://host#", (): void => {
        const url = "http://host#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new NotIpv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.FragmentBegin)
        expect(actual.startIndex).toStrictEqual(11)
        expect(actual.host).toStrictEqual("host")
    });

    it("invalid host(not ipv6). empty. http://", (): void => {
        const url = "http://"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new NotIpv6HostBeginState(url, 7, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.host).toStrictEqual("")
    });
})

describe("PortBeginState", (): void => {
    it("valid port. http://host:1", (): void => {
        const url = "http://host:1"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PortBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End);
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.port).toStrictEqual("1");
    });

    it("valid port. http://host:65535", (): void => {
        const url = "http://host:65535"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PortBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End);
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.port).toStrictEqual("65535");
    });

    it("valid port. next is path. http://host:1/", (): void => {
        const url = "http://host:1/"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PortBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.PathBegin)
        expect(actual.startIndex).toStrictEqual(13)
        expect(actual.port).toStrictEqual("1")
    });

    it("valid port. next is query. http://host:1?", (): void => {
        const url = "http://host:1?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PortBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.QueryBegin)
        expect(actual.startIndex).toStrictEqual(13)
        expect(actual.port).toStrictEqual("1")
    });

    it("valid port. next is fragment. http://host:1#", (): void => {
        const url = "http://host:1#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PortBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.FragmentBegin)
        expect(actual.startIndex).toStrictEqual(13)
        expect(actual.port).toStrictEqual("1")
    });

    it("invalid port. invalid range. http://host:65536", (): void => {
        const url = "http://host:65536"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PortBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.port).toStrictEqual("")
    });
})

describe("PathBeginState", (): void => {
    it("valid path. http://host/path", (): void => {
        const url = "http://host/path"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.path).toStrictEqual("/path")
    });

    it("valid path. with sub dir. http://host/path1/path2", (): void => {
        const url = "http://host/path1/path2"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.path).toStrictEqual("/path1/path2")
    });

    it("valid path. with extension. http://host/path.html", (): void => {
        const url = "http://host/path.html"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.path).toStrictEqual("/path.html");
    });

    it("valid path. empty. http://host/", (): void => {
        const url = "http://host/"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.path).toStrictEqual("/")
    });

    it("valid path. with query. http://host/path?", (): void => {
        const url = "http://host/path?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.QueryBegin)
        expect(actual.startIndex).toStrictEqual(16)
        expect(actual.path).toStrictEqual("/path")
    });

    it("valid path. with fragment. http://host/path#", (): void => {
        const url = "http://host/path#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.FragmentBegin)
        expect(actual.startIndex).toStrictEqual(16)
        expect(actual.path).toStrictEqual("/path")
    });

    it("invalid path. with reserved char. http://host/[", (): void => {
        const url = "http://host/["
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new PathBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.Error)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.path).toStrictEqual("")
    });
})

describe("QueryBeginState", (): void => {
    it("valid query. http://host?query", (): void => {
        const url = "http://host?query"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.query).toStrictEqual("query")
    });

    it("valid query. with key-value. http://host?key=value", (): void => {
        const url = "http://host?key=value"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.query).toStrictEqual("key=value")
    });

    it("valid query. with multiple key-value. http://host?key=value&key=value", (): void => {
        const url = "http://host?key=value&key=value"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.query).toStrictEqual("key=value&key=value")
    });

    it("valid query. empty. http://host?", (): void => {
        const url = "http://host?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.query).toStrictEqual("")
    });

    it("valid query. contains delims. http://host?/:?@[]", (): void => {
        const url = "http://host?/:?@[]"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.query).toStrictEqual("/:?@[]")
    });

    it("valid query. empty and ends with fragment. http://host?#", (): void => {
        const url = "http://host?#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.FragmentBegin)
        expect(actual.query).toStrictEqual("");
    });

    it("valid query. ends with fragment. http://host?query#", (): void => {
        const url = "http://host?query#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.FragmentBegin)
        expect(actual.query).toStrictEqual("query")
    });

    it("configure, with prefix.", (): void => {
        const config = new UriParserConfig()
        config.keepQueryPrefix = true

        const url = "http://host?query"
        const before = new InitialParseState(config, url)
        const state = new QueryBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.query).toStrictEqual("?query")
    });
})


describe("FragmentBeginState", (): void => {
    it("valid fragment. http://host#fragment", (): void => {
        const url = "http://host#fragment"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new FragmentBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.fragment).toStrictEqual("fragment")
    });

    it("valid fragment. empty. http://host#", (): void => {
        const url = "http://host#"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new FragmentBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.fragment).toStrictEqual("");
    });

    it("valid fragment. with sub delims. http://host##?", (): void => {
        const url = "http://host##?"
        const before = new InitialParseState(PARSER_CONFIG_DEFAULT, url)
        const state = new FragmentBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.type).toStrictEqual(UriParseStateType.End)
        expect(actual.startIndex).toStrictEqual(-1)
        expect(actual.fragment).toStrictEqual("#?");
    });

    it("configure, with prefix.", (): void => {
        const config = new UriParserConfig()
        config.keepFragmentPrefix = true

        const url = "http://host#fragment"
        const before = new InitialParseState(config, url)
        const state = new FragmentBeginState(url, 11, before)
        const actual = state.parse()

        expect(actual.fragment).toStrictEqual("#fragment")
    });

})

describe("UriParser.parse", (): void => {
    describe("commonly", (): void => {
        it("with all its components.", (): void => {
            const url = "http://user:pass@host:1/path?query#hash"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("http");
            expect(actual.user).toStrictEqual("user");
            expect(actual.password).toStrictEqual("pass");
            expect(actual.host).toStrictEqual("host");
            expect(actual.port).toStrictEqual("1");
            expect(actual.path).toStrictEqual("/path");
            expect(actual.query).toStrictEqual("query");
            expect(actual.fragment).toStrictEqual("hash");
        });

        it("domain only", (): void => {
            const url = "http://domain.com"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("http");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("domain.com");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("/");
            expect(actual.query).toStrictEqual("");
            expect(actual.fragment).toStrictEqual("");
        });

        it("with query", (): void => {
            const url = "http://domain.com/path?key=value"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("http");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("domain.com");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("/path");
            expect(actual.query).toStrictEqual("key=value");
            expect(actual.fragment).toStrictEqual("");
        });

        it("empty", (): void => {
            const url = ""
            const actual = new UriParser().parse(url)

            expect(actual.error).toStrictEqual(" is not a valid URL.");
            expect(actual.scheme).toStrictEqual("");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("");
            expect(actual.query).toStrictEqual("");
            expect(actual.fragment).toStrictEqual("");
        });

        it("null", (): void => {
            const url: string | null = null
            const actual = new UriParser().parse(url)

            expect(actual.error).toStrictEqual("null is not a valid URL.");
            expect(actual.scheme).toStrictEqual("");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("");
            expect(actual.query).toStrictEqual("");
            expect(actual.fragment).toStrictEqual("");
        });
    });

    describe("rfc examples.", (): void => {
        it("ftp://ftp.is.co.za/rfc/rfc1808.txt", (): void => {
            const url = "ftp://ftp.is.co.za/rfc/rfc1808.txt"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("ftp");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("ftp.is.co.za");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("/rfc/rfc1808.txt");
            expect(actual.query).toStrictEqual("");
            expect(actual.fragment).toStrictEqual("");
        });

        it("http://www.ietf.org/rfc/rfc2396.txt", (): void => {
            const url = "http://www.ietf.org/rfc/rfc2396.txt"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("http");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("www.ietf.org");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("/rfc/rfc2396.txt");
            expect(actual.query).toStrictEqual("");
            expect(actual.fragment).toStrictEqual("");
        });

        it("ldap://[2001:db8::7]/c=GB?objectClass?one", (): void => {
            const url = "ldap://[2001:db8::7]/c=GB?objectClass?one"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("ldap");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("[2001:db8::7]");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("/c=GB");
            expect(actual.query).toStrictEqual("objectClass?one");
            expect(actual.fragment).toStrictEqual("");
        });

        it("mailto:John.Doe@example.com", (): void => {
            const url = "mailto:John.Doe@example.com"
            const actual = new UriParser().parse(url)

            expect(actual.error).toBeNull();
            expect(actual.scheme).toStrictEqual("mailto");
            expect(actual.user).toStrictEqual("");
            expect(actual.password).toStrictEqual("");
            expect(actual.host).toStrictEqual("");
            expect(actual.port).toStrictEqual("");
            expect(actual.path).toStrictEqual("John.Doe@example.com");
            expect(actual.query).toStrictEqual("");
            expect(actual.fragment).toStrictEqual("");
        });
    })
});