import { UriComponents, UriParser } from "./UriParser"

/**
 * em
 */
export class URL {
    private _parser: UriParser = new UriParser();
    private _components: UriComponents = new UriComponents();
    private _protocol: string = "";
    private _origin: string = "";
    private _host: string = "";
    private _hostname: string = "";

    public constructor(url: string, base: string | null = null) {
        this._parser.config.keepSchemeDelimiter = true;
        this._parser.config.keepQueryPrefix = true;
        this._parser.config.keepFragmentPrefix = true;
        this._components = this._parser.parse(url);

        if (base != null) {
            throw new Error("not supported.")
        }

        this.setup();
    }

    private setup(): void {
        if (this.isValid) {
            this._protocol = this._components.scheme;

            if (this._components.hasAuthority) {
                this._hostname = this._components.host;
                if (this._components.port.length == 0) {
                    this._host = this._components.host;
                } else {
                    this._host = this._components.host + ":" + this._components.port;
                }
                this._origin = this._protocol + "//" + this.host;

            } else {
                this._hostname = "";
                this._host = "";
                this._origin = "";
            }

        } else {
            this._protocol = "";
            this._hostname = "";
            this._host = "";
            this._origin = "";
        }
    }

    get isValid(): boolean {
        return this._components.error == null;
    }

    set href(href: string) {
        this._components = this._parser.parse(href);
        this.setup();
    }

    get href(): string {
        return this._components.uri;
    }

    get origin(): string {
        return this._origin;
    }

    get protocol(): string {
        return this._protocol;
    }

    get username(): string {
        return this._components.user;
    }

    get password(): string {
        return this._components.password;
    }

    get host(): string {
        return this._host;
    }

    get hostname(): string {
        return this._hostname;
    }

    get port(): string {
        return this._components.port;
    }

    get pathname(): string {
        return this._components.path;
    }

    get search(): string {
        return this._components.query;
    }

    get hash(): string {
        return this._components.fragment;
    }
}
