from pathlib import Path
from shutil import copyfile

from w3nest.ci.ts_frontend import (
    PackageType,
    Dependencies,
    RunTimeDeps,
    DevServer,
    Bundles,
    MainModule,
    ProjectConfig,
)
from w3nest.ci.ts_frontend.regular import generate_template
from w3nest.utils import parse_json


project_folder = Path(__file__).parent.parent

pkg_json = parse_json(project_folder / "package.json")
pkg_json_rxvdom = parse_json(project_folder / ".." / "package.json")
# (cd ./node_modules/@youwol/mkdocs-ts/bin/ && node index.js --project ../../../../.. --nav /api --out ../../../../assets/api)
externals_deps = {
    "mkdocs-ts": "^0.5.1",
    "@mkdocs-ts/code-api": "^0.2.0",
    "@mkdocs-ts/notebook": "^0.1.1",
    "rx-vdom": f"^{pkg_json_rxvdom['version'].replace('-wip', '')}",
    "@w3nest/webpm-client": "^0.1.10",
    "rxjs": "^7.8.2",
    "@w3nest/ui-tk": "^0.1.5",
}
in_bundle_deps = {}
dev_deps = {
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
}

config = ProjectConfig(
    path=project_folder,
    type=PackageType.APPLICATION,
    name=pkg_json["name"],
    version=pkg_json_rxvdom["version"],
    shortDescription=pkg_json["description"],
    author=pkg_json["author"],
    dependencies=Dependencies(
        runTime=RunTimeDeps(externals=externals_deps, includedInBundle=in_bundle_deps),
        devTime=dev_deps,
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile="app/main.ts",
            loadDependencies=[
                "mkdocs-ts",
                "rx-vdom",
                "@w3nest/webpm-client",
                "rxjs",
                "@w3nest/ui-tk/Badges",
            ],
        )
    ),
    devServer=DevServer(port=3027),
    inPackageJson={
        "scripts": {"doc": "npx tsx .w3nest/doc.ts"},
    },
)

template_folder = project_folder / ".w3nest" / ".template"
generate_template(config=config, dst_folder=template_folder)

files = [
    ".gitignore",
    ".prettierignore",
    "package.json",
    "jest.config.ts",
    "webpack.config.ts",
    "typedoc.js",
]
for file in files:
    copyfile(src=template_folder / file, dst=project_folder / file)
