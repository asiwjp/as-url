export class UriComponents {
    uri: string = ""
    scheme: string = ""
    user: string = ""
    password: string = ""
    host: string = ""
    port: string = ""
    path: string = ""
    query: string = ""
    fragment: string = ""
    hasAuthority: boolean = false
    isValid: boolean = false
    error: string | null = null
}

export class UriParserConfig {
    keepSchemeDelimiter: boolean = false;
    keepQueryPrefix: boolean = false;
    keepFragmentPrefix: boolean = false;
}

export class UriParser {
    private _config: UriParserConfig = new UriParserConfig();

    get config(): UriParserConfig {
        return this._config;
    }

    parse(uri: string | null): UriComponents {
        if (uri == null) {
            return {
                uri: "",
                scheme: "",
                user: "",
                password: "",
                host: "",
                port: "",
                path: "",
                query: "",
                fragment: "",
                hasAuthority: false,
                isValid: false,
                error: "null is not a valid URL."
            }
        }

        let state: UriParseState = new InitialParseState(this._config, uri);
        while (true) {
            state = state.parse();
            if (state.type == UriParseStateType.End) {
                break;
            }
            if (state.type == UriParseStateType.Error) {
                return {
                    uri: state.uri,
                    scheme: "",
                    user: "",
                    password: "",
                    host: "",
                    port: "",
                    path: "",
                    query: "",
                    fragment: "",
                    hasAuthority: false,
                    isValid: false,
                    error: state.uri + " is not a valid URL."
                }
            }
        }

        return {
            uri: state.uri,
            scheme: state.scheme,
            user: state.user,
            password: state.password,
            host: state.host,
            port: state.port,
            path: state.path,
            query: state.query,
            fragment: state.fragment,
            hasAuthority: state.hasAuthority,
            isValid: true,
            error: null
        }
    }
}

export enum UriCharType {
    FORBIDDEN,
    UNRESERVED = 0x1000,
    RESERVED = 0x2000,
    UNRESERVED_DIGIT = 0x1001,
    UNRESERVED_ALPHA = 0x1002,
    UNRESERVED_MARK = 0x1004,
    RESERVED_DELIM = 0x2010,
    RESERVED_SUB_DELIM = 0x2020,
    PCT_ENCODE_LETTER = 0x4000
}

const charTypes: UriCharType[] = [
    UriCharType.UNRESERVED_MARK, // !
    UriCharType.FORBIDDEN, // "
    UriCharType.RESERVED_DELIM, // #
    UriCharType.RESERVED_SUB_DELIM, // $
    UriCharType.PCT_ENCODE_LETTER, // %
    UriCharType.RESERVED_SUB_DELIM, // &
    UriCharType.RESERVED_SUB_DELIM, // '
    UriCharType.RESERVED_SUB_DELIM, // (
    UriCharType.RESERVED_SUB_DELIM, // )
    UriCharType.RESERVED_SUB_DELIM, // *
    UriCharType.RESERVED_SUB_DELIM, // +
    UriCharType.RESERVED_SUB_DELIM, // ,
    UriCharType.UNRESERVED_MARK, // -
    UriCharType.UNRESERVED_MARK, // .
    UriCharType.RESERVED_DELIM, // slash
    UriCharType.UNRESERVED_DIGIT, // 0
    UriCharType.UNRESERVED_DIGIT, // 1
    UriCharType.UNRESERVED_DIGIT, // 2
    UriCharType.UNRESERVED_DIGIT, // 3
    UriCharType.UNRESERVED_DIGIT, // 4
    UriCharType.UNRESERVED_DIGIT, // 5
    UriCharType.UNRESERVED_DIGIT, // 6
    UriCharType.UNRESERVED_DIGIT, // 7
    UriCharType.UNRESERVED_DIGIT, // 8
    UriCharType.UNRESERVED_DIGIT, // 9
    UriCharType.RESERVED_DELIM, // :
    UriCharType.RESERVED_SUB_DELIM, // ;
    UriCharType.FORBIDDEN, // <
    UriCharType.RESERVED_SUB_DELIM, // =
    UriCharType.FORBIDDEN, // >
    UriCharType.RESERVED_DELIM, // ?
    UriCharType.RESERVED_DELIM, // @
    UriCharType.UNRESERVED_ALPHA, // A
    UriCharType.UNRESERVED_ALPHA, // B
    UriCharType.UNRESERVED_ALPHA, // C
    UriCharType.UNRESERVED_ALPHA, // D
    UriCharType.UNRESERVED_ALPHA, // E
    UriCharType.UNRESERVED_ALPHA, // F
    UriCharType.UNRESERVED_ALPHA, // G
    UriCharType.UNRESERVED_ALPHA, // H
    UriCharType.UNRESERVED_ALPHA, // I
    UriCharType.UNRESERVED_ALPHA, // J
    UriCharType.UNRESERVED_ALPHA, // K
    UriCharType.UNRESERVED_ALPHA, // L
    UriCharType.UNRESERVED_ALPHA, // M
    UriCharType.UNRESERVED_ALPHA, // N
    UriCharType.UNRESERVED_ALPHA, // O
    UriCharType.UNRESERVED_ALPHA, // P
    UriCharType.UNRESERVED_ALPHA, // Q
    UriCharType.UNRESERVED_ALPHA, // R
    UriCharType.UNRESERVED_ALPHA, // S
    UriCharType.UNRESERVED_ALPHA, // T
    UriCharType.UNRESERVED_ALPHA, // U
    UriCharType.UNRESERVED_ALPHA, // V
    UriCharType.UNRESERVED_ALPHA, // W
    UriCharType.UNRESERVED_ALPHA, // X
    UriCharType.UNRESERVED_ALPHA, // Y
    UriCharType.UNRESERVED_ALPHA, // Z
    UriCharType.RESERVED_DELIM, // [
    UriCharType.FORBIDDEN, // back slash
    UriCharType.RESERVED_DELIM, // ]
    UriCharType.FORBIDDEN, // ^
    UriCharType.UNRESERVED_MARK, // _
    UriCharType.FORBIDDEN, // back quote
    UriCharType.UNRESERVED_ALPHA, // a
    UriCharType.UNRESERVED_ALPHA, // b
    UriCharType.UNRESERVED_ALPHA, // c
    UriCharType.UNRESERVED_ALPHA, // d
    UriCharType.UNRESERVED_ALPHA, // e
    UriCharType.UNRESERVED_ALPHA, // f
    UriCharType.UNRESERVED_ALPHA, // g
    UriCharType.UNRESERVED_ALPHA, // h
    UriCharType.UNRESERVED_ALPHA, // i
    UriCharType.UNRESERVED_ALPHA, // j
    UriCharType.UNRESERVED_ALPHA, // k
    UriCharType.UNRESERVED_ALPHA, // l
    UriCharType.UNRESERVED_ALPHA, // m
    UriCharType.UNRESERVED_ALPHA, // n
    UriCharType.UNRESERVED_ALPHA, // o
    UriCharType.UNRESERVED_ALPHA, // p
    UriCharType.UNRESERVED_ALPHA, // q
    UriCharType.UNRESERVED_ALPHA, // r
    UriCharType.UNRESERVED_ALPHA, // s
    UriCharType.UNRESERVED_ALPHA, // t
    UriCharType.UNRESERVED_ALPHA, // u
    UriCharType.UNRESERVED_ALPHA, // v
    UriCharType.UNRESERVED_ALPHA, // w
    UriCharType.UNRESERVED_ALPHA, // x
    UriCharType.UNRESERVED_ALPHA, // y
    UriCharType.UNRESERVED_ALPHA, // z
    UriCharType.FORBIDDEN, // {
    UriCharType.FORBIDDEN, // |
    UriCharType.FORBIDDEN, // }
    UriCharType.UNRESERVED_MARK, // ~
]
// unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
// reserved      = gen-delims / sub-delims
// gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
// sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
//               / "*" / "+" / "," / ";" / "="

const CODE_SLASH = 0x2f;
const CODE_COLON = 0x3a;
const CODE_QUESTION_MARK = 0x3f;
const CODE_AT_MARK = 0x40;
const CODE_PLUS_SIGN = 0x2b;
const CODE_MINUS_SIGN = 0x2d;
const CODE_DOT = 0x2e;
const CODE_SHARP = 0x23;
const CODE_0 = 0x30;
const CODE_9 = 0x39;
const CODE_CAPITAL_A = 0x41;
const CODE_CAPITAL_F = 0x46;
const CODE_SMALL_A = 0x61;
const CODE_SMALL_F = 0x66;
const CODE_LEFT_BRACKET = 0x5b;
const CODE_RIGHT_BRACKET = 0x5d;

export enum UriParseStateType {
    Initial,
    AuthorityBegin,
    UserInfoBegin,
    HostBegin,
    Ipv6HostBegin,
    NotIpv6HostBegin,
    PortBegin,
    PathBegin,
    QueryBegin,
    FragmentBegin,
    End,
    Error
}

export abstract class UriParseState {
    config: UriParserConfig;
    type: UriParseStateType;
    uri: string;
    startIndex: i32;
    scheme: string;
    user: string;
    password: string;
    host: string;
    port: string;
    path: string;
    query: string;
    fragment: string;
    hasAuthority: boolean;

    constructor(type: UriParseStateType, config: UriParserConfig, uri: string, startIndex: i32, before: UriParseState | null = null) {
        this.type = type;
        this.config = config;
        this.uri = uri;
        this.startIndex = startIndex;

        if (before != null) {
            this.scheme = before.scheme;
            this.user = before.user;
            this.password = before.password;
            this.host = before.host;
            this.port = before.port;
            this.path = before.path;
            this.query = before.query;
            this.fragment = before.fragment;
            this.hasAuthority = before.hasAuthority;
        } else {
            this.scheme = "";
            this.user = "";
            this.password = "";
            this.host = "";
            this.port = "";
            this.path = "/";
            this.query = "";
            this.fragment = "";
            this.hasAuthority = false;
        }
    }

    abstract parse(): UriParseState;

    peekCharCode(i: i32): i32 {
        if (i >= this.uri.length) {
            return -1;
        }
        return this.uri.charCodeAt(i);
    }

    static getCharType(c: i32): UriCharType {
        if (c <= 0x20) {
            return UriCharType.FORBIDDEN
        }
        if (c >= 0x7f) {
            return UriCharType.FORBIDDEN
        }
        return charTypes[c - 0x21];
    }

    isHexChar(c: i32): boolean {
        const ctype = UriParseState.getCharType(c);
        if (ctype == UriCharType.UNRESERVED_DIGIT) {
            return true;
        }
        if (CODE_CAPITAL_A <= c && c <= CODE_CAPITAL_F) {
            return true;
        }
        if (CODE_SMALL_A <= c && c <= CODE_SMALL_F) {
            return true;
        }
        return false;
    }

    isPChar(c: i32): boolean {
        const charType: UriCharType = UriParseState.getCharType(c);
        if (charType & UriCharType.UNRESERVED) {
            return true;
        }
        if (charType == UriCharType.RESERVED_SUB_DELIM) {
            return true;
        }
        if (charType == UriCharType.PCT_ENCODE_LETTER) {
            return true;
        }
        // :
        if (c == CODE_COLON) {
            return true;
        }
        // @
        if (c == CODE_AT_MARK) {
            return true;
        }
        return false;
    }
}

export class InitialParseState extends UriParseState {
    constructor(config: UriParserConfig, uri: string) {
        super(UriParseStateType.Initial, config, uri, 0);
    }

    public parse(): UriParseState {
        let c: i32 = 0;
        let i: i32 = this.startIndex;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);
            const ctype = UriParseState.getCharType(c);

            if (ctype & UriCharType.UNRESERVED_ALPHA) {
                continue;
            }
            if (ctype & UriCharType.UNRESERVED_DIGIT) {
                continue;
            }
            // +
            if (c == CODE_PLUS_SIGN) {
                continue;
            }
            // -
            if (c == CODE_MINUS_SIGN) {
                continue;
            }
            // .
            if (c == CODE_DOT) {
                continue;
            }
            break;
        }
        let end = i;

        if (end == this.startIndex) {
            return new ParseErrorState(this.uri, this);
        }

        if (c != CODE_COLON) {
            return new ParseErrorState(this.uri, this);
        }

        if (this.config.keepSchemeDelimiter) {
            this.scheme = this.uri.substring(this.startIndex, end + 1);
        } else {
            this.scheme = this.uri.substring(this.startIndex, end);
        }
        ++end;
        if (this.uri.substr(end, 2) == "//") {
            this.hasAuthority = true;
            return new AuthorityBeginState(this.uri, end + 2, this);
        }
        return new PathBeginState(this.uri, end, this);
    }
}

export class AuthorityBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.AuthorityBegin, before.config, uri, startIndex, before);
    }

    public parse(): UriParseState {
        let c: i32 = 0;
        let i = this.startIndex;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);

            // @
            if (c == CODE_AT_MARK) {
                return new UserInfoBeginState(this.uri, this.startIndex, this);
            }

            // slash
            if (c == CODE_SLASH) {
                return new HostBeginState(this.uri, this.startIndex, this);
            }

            // ?
            if (c == CODE_QUESTION_MARK) {
                return new HostBeginState(this.uri, this.startIndex, this);
            }

            // #
            if (c == CODE_SHARP) {
                return new HostBeginState(this.uri, this.startIndex, this);
            }
        }
        return new HostBeginState(this.uri, this.startIndex, this);
    }
}

export class UserInfoBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.UserInfoBegin, before.config, uri, startIndex, before);
    }

    public parse(): UriParseState {
        let colon_index: i32 = -1;
        let at_mark_index = -1;

        let c: i32 = 0;
        let i = this.startIndex;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);

            // :
            if (c == CODE_COLON) {
                if (colon_index != -1) {
                    return new ParseErrorState(this.uri, this);
                }
                colon_index = i;
                continue;
            }

            // @
            if (c == CODE_AT_MARK) {
                at_mark_index = i;
                break;
            }
        }
        if (at_mark_index == -1) {
            return new ParseErrorState(this.uri, this);
        }
        if (colon_index == -1) {
            this.user = this.uri.substring(this.startIndex, at_mark_index)

        } else {
            this.user = this.uri.substring(this.startIndex, colon_index)
            this.password = this.uri.substring(colon_index + 1, at_mark_index)
        }
        return new HostBeginState(this.uri, at_mark_index + 1, this);
    }
}

export class HostBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.HostBegin, before.config, uri, startIndex, before);
    }

    public parse(): UriParseState {
        if (this.startIndex >= this.uri.length) {
            return new ParseErrorState(this.uri, this);
        }
        const c = this.uri.charCodeAt(this.startIndex);
        if (c == CODE_LEFT_BRACKET) {
            return new Ipv6HostBeginState(this.uri, this.startIndex, this);
        }

        return new NotIpv6HostBeginState(this.uri, this.startIndex, this);
    }
}

export class Ipv6HostBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.Ipv6HostBegin, before.config, uri, startIndex, before);
    }

    public parse(): UriParseState {
        let left_brackets = 0;
        let c: i32 = 0;
        let i = this.startIndex;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);

            if (c == CODE_LEFT_BRACKET) {
                ++left_brackets;
                if (left_brackets == 2) {
                    return new ParseErrorState(this.uri, this);
                }
                continue;
            }

            if (c == CODE_RIGHT_BRACKET) {
                if (this.startIndex + 1 == i) {
                    return new ParseErrorState(this.uri, this);
                }

                const next = i + 1
                this.host = this.uri.substring(this.startIndex, next);
                const nextC = this.peekCharCode(next);
                if (nextC == -1) {
                    return new ParseEndState(this.uri, this);
                }
                if (nextC == CODE_COLON) {
                    return new PortBeginState(this.uri, next, this);
                }
                if (nextC == CODE_SLASH) {
                    return new PathBeginState(this.uri, next, this);
                }
                if (nextC == CODE_QUESTION_MARK) {
                    return new QueryBeginState(this.uri, next, this);
                }
                if (nextC == CODE_SHARP) {
                    return new FragmentBeginState(this.uri, next, this);
                }
                return new ParseErrorState(this.uri, this);
            }
        }
        return new ParseErrorState(this.uri, this);
    }
}

export class NotIpv6HostBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.NotIpv6HostBegin, before.config, uri, startIndex, before);
    }

    public parse(): UriParseState {
        if (this.startIndex >= this.uri.length) {
            return new ParseErrorState(this.uri, this);
        }

        let c: i32 = 0;
        let i = this.startIndex;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);

            if (c == CODE_COLON) {
                this.host = this.uri.substring(this.startIndex, i);
                return new PortBeginState(this.uri, i, this);
            }
            if (c == CODE_SLASH) {
                this.host = this.uri.substring(this.startIndex, i);
                return new PathBeginState(this.uri, i, this);
            }
            if (c == CODE_QUESTION_MARK) {
                this.host = this.uri.substring(this.startIndex, i);
                return new QueryBeginState(this.uri, i, this);
            }
            if (c == CODE_SHARP) {
                this.host = this.uri.substring(this.startIndex, i);
                return new FragmentBeginState(this.uri, i, this);
            }
        }
        this.host = this.uri.substring(this.startIndex, i);
        return new ParseEndState(this.uri, this);
    }
}

export class PortBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.PortBegin, before.config, uri, startIndex, before);
    }

    parse(): UriParseState {
        let numStartIndex = this.startIndex + 1;
        if (numStartIndex >= this.uri.length) {
            return new ParseErrorState(this.uri, this);
        }

        let c: i32 = 0;
        let i = numStartIndex;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);
            const ctype = UriParseState.getCharType(c);
            if (ctype != UriCharType.UNRESERVED_DIGIT) {
                break;
            }
        }
        let end = i;

        const value = this.uri.substring(numStartIndex, end);
        if (0 == value.length || value.length > 5) {
            return new ParseErrorState(this.uri, this);
        }

        const port = parseInt(value);
        if (port > 65535) {
            return new ParseErrorState(this.uri, this);
        }
        this.port = value;

        if (end == this.uri.length) {
            return new ParseEndState(this.uri, this);
        }

        if (c == CODE_SLASH) {
            return new PathBeginState(this.uri, end, this);
        }

        if (c == CODE_QUESTION_MARK) {
            return new QueryBeginState(this.uri, end, this);
        }

        if (c == CODE_SHARP) {
            return new FragmentBeginState(this.uri, end, this);
        }

        return new ParseErrorState(this.uri, this);
    }
}

export class PathBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.PathBegin, before.config, uri, startIndex, before);
    }

    parse(): UriParseState {
        let c: i32 = 0;
        let i = this.startIndex + 1;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);

            if (this.isPChar(c)) {
                continue;
            }

            // slash
            if (c == CODE_SLASH) {
                continue;
            }

            break;
        }
        let end = i;

        const value = this.uri.substring(this.startIndex, end);
        if (end == this.uri.length) {
            this.path = value;
            return new ParseEndState(this.uri, this);
        }
        if (c == CODE_QUESTION_MARK) {
            this.path = value;
            return new QueryBeginState(this.uri, end, this);
        }
        if (c == CODE_SHARP) {
            this.path = value;
            return new FragmentBeginState(this.uri, end, this);
        }

        this.path = "";
        return new ParseErrorState(this.uri, this);
    }
}

export class QueryBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.QueryBegin, before.config, uri, startIndex, before);
    }

    parse(): UriParseState {
        let valueStart = this.startIndex;
        if (!this.config.keepQueryPrefix) {
            valueStart++;
        }
        let c: i32 = 0;
        let i = valueStart;
        for (; i < this.uri.length; ++i) {
            c = this.uri.charCodeAt(i);

            if (c == CODE_SHARP) {
                break;
            }
        }
        let end = i;

        const value = this.uri.substring(valueStart, end);
        this.query = value;

        if (end == this.uri.length) {
            return new ParseEndState(this.uri, this);
        }

        if (c == CODE_SHARP) {
            return new FragmentBeginState(this.uri, end, this);
        }

        return new ParseErrorState(this.uri, this);
    }
}

export class FragmentBeginState extends UriParseState {
    constructor(uri: string, startIndex: i32, before: UriParseState) {
        super(UriParseStateType.FragmentBegin, before.config, uri, startIndex, before);
    }

    parse(): UriParseState {
        let valueStart = this.startIndex;
        if (!this.config.keepFragmentPrefix) {
            valueStart++;
        }
        this.fragment = this.uri.substring(valueStart);
        return new ParseEndState(this.uri, this);
    }
}

export class ParseEndState extends UriParseState {
    constructor(uri: string, before: UriParseState) {
        super(UriParseStateType.End, before.config, uri, -1, before);
    }

    parse(): UriParseState {
        throw new Error();
    }
}

export class ParseErrorState extends UriParseState {
    constructor(uri: string, before: UriParseState) {
        super(UriParseStateType.Error, before.config, uri, -1, before);
    }

    parse(): UriParseState {
        throw new Error();
    }
}