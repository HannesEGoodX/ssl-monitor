import ssl
import socket
import json
from datetime import datetime

sites = [
    "goodx.healthcare",
    "goodx.co.za",
    "goodx.co.nz",
    "goodxnamibia.com",
    "goodx.co.bw",
    "goodx.co.uk",
    "goodx.us",
    "goodx.international",
    "goodxeye.com"
]

results = []

for site in sites:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((site, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=site) as ssock:
                cert = ssock.getpeercert()
                expiry = datetime.strptime(
                    cert["notAfter"], "%b %d %H:%M:%S %Y %Z"
                ).strftime("%Y-%m-%d")

        results.append({
            "site": site,
            "expiry": expiry
        })
    except Exception:
        results.append({
            "site": site,
            "expiry": "Unavailable"
        })

with open("status.json", "w") as f:
    json.dump(results, f, indent=2)
