# as-url
Provides a window.url imitation class and url-related utilities.

## api

### URL class
```
import { URL } from "@rockhouse/as-url/assembly"

const url = new URL("https://user:pass@localhost:8080/path?query#fragment")
url.isValid // true
url.origin // https://localhost:8080
url.protocol // https:
url.username // user
url.password // pass
url.host // localhost:8080
url.hostname // localhost
url.port // 8080
url.pathname // /path
url.search // ?query
url.hash // #fragment
```

### UriParser class
```
import { UriParser } from "@rockhouse/as-url/assembly"

const components = new UriParser().parse("https://user:pass@localhost:8080/path?query#fragment")
components.scheme // https
components.user // user
components.password // pass
components.host // localhost
components.port // 8080
components.path // /path
components.query // query
components.fragment // fragment
components.error // null
```

## list of incompatibilities(TODO)
- The URL class does not raise an exception when a malformed URL is given. This is because AssemblyScript does not support try/catch. If you want to know the validity of a given URL, you can use the isValid property.
- In the URL class, The base argument for constructor is not yet supported.
- In the URL class, href is the only supported property setter.
- The correctness of some elements such as URL encoding and IPv6 has not yet been verified.
- URLSearchParams is not implemented.

## License
Apache-2.0([LICENSE])