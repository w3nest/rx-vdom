from shutil import copyfile
from pathlib import Path

from w3nest.ci.ts_frontend import (
    ProjectConfig,
    PackageType,
    Dependencies,
    RunTimeDeps,
    Bundles,
    MainModule,
)
from w3nest.ci.ts_frontend.regular import generate_template
from w3nest.utils import parse_json

project_folder = Path(__file__).parent.parent

pkg_json = parse_json(project_folder / "package.json")

externals_deps = {}
in_bundle_deps = {
    # polyfill for WebKt based browsers (e.g. Safari)
    # see https://github.com/WebKit/standards-positions/issues/97
    "@ungap/custom-elements": "1.3.0",
    # `csstype` is only about types, it is not in dev dependencies as we want it to be downloaded by consuming packages.
    "csstype": "^2.6.0",
    # `conditional-type-checks` is used to realize 'compile time' tests on type definitions
    # it is not in dev dependencies as we want it to be downloaded by consuming packages.
    "conditional-type-checks": "^1.0.6",
    # json5 is used in bin/rx-vdom-init.js, also not in dev dependencies to have it available in consuming projects
    "json5": "^2.2.3",
}
dev_deps = {
    "typedoc-plugin-mdn-links": "^4.0.13",
    "rxjs": "^7.5.6",
    "rxjs-spy": "^8.0.2",
}

config = ProjectConfig(
    path=project_folder,
    type=PackageType.LIBRARY,
    name=pkg_json["name"],
    version=pkg_json["version"],
    shortDescription=pkg_json["description"],
    author=pkg_json["author"],
    dependencies=Dependencies(
        runTime=RunTimeDeps(externals=externals_deps, includedInBundle=in_bundle_deps),
        devTime=dev_deps,
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile="./index.ts",
            loadDependencies=list(externals_deps.keys()),
            aliases=[],
        )
    ),
    inPackageJson={
        "scripts": {"lint-eslint-check": "eslint ./src/lib"},
        "bin": {"rx-vdom-init": "./bin/rx-vdom-init.js"},
    },
)

template_folder = project_folder / ".w3nest" / ".template"
generate_template(config=config, dst_folder=template_folder)

files = [
    # "README.md",
    ".gitignore",
    # ".npmignore", added 'rx-vdom-doc'
    # ".prettierignore", added 'rx-vdom-doc'
    "package.json",
    # "tsconfig.json", This file needs to include reference to 'rx-vdom-config.ts'
    # "jest.config.ts", added 'testPathIgnorePatterns: 'rx-vdom-doc', 'examples'
    "webpack.config.ts",
]
for file in files:
    copyfile(src=template_folder / file, dst=project_folder / file)
