from pathlib import Path
from w3nest.utils import parse_json
from w3nest_client.http.webpm import (
    Package,
    WebApp,
    Distribution,
    FileListing,
    MainWebApp,
)

project_folder = Path(__file__).parent.parent
pkg_json = parse_json(project_folder / "package.json")

Package(
    name=pkg_json["name"],
    version=pkg_json["version"],
    specification=WebApp(main=MainWebApp(entryPoint=pkg_json["main"])),
    distribution=Distribution(
        files=FileListing(
            include=["index.html"],
            ignore=[],
        ),
    ),
)
