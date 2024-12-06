import shutil
from pathlib import Path

from w3nest.ci.ts_frontend import ProjectConfig, PackageType, Dependencies, \
    RunTimeDeps, generate_template, DevServer, Bundles, MainModule
from w3nest.utils import parse_json

project_folder = Path(__file__).parent.parent

pkg_json = parse_json(project_folder / 'package.json')

load_dependencies = {
    "rxjs": "^7.5.6",
    "rx-vdom": "^0.1.1",
    "@w3nest/webpm-client": "^0.1.2"
}

config = ProjectConfig(
    path=project_folder,
    type=PackageType.APPLICATION,
    name=pkg_json['name'],
    version=pkg_json['version'],
    shortDescription=pkg_json['description'],
    author=pkg_json['author'],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals=load_dependencies
        )
    ),
    devServer=DevServer(
        port=4001
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile='./index.ts',
            loadDependencies=list(load_dependencies.keys())
        )

    )
)


template_folder = project_folder / '.w3nest' / '.template'

generate_template(config=config, dst_folder=template_folder)

files = [
    Path("src") / "auto-generated.ts",
    'README.md',
    '.gitignore',
    '.npmignore',
    '.prettierignore',
    'package.json',
    'jest.config.ts',
    'tsconfig.json',
    'webpack.config.ts'
    ]
for file in files:
    shutil.copyfile(src=template_folder / file, dst=project_folder / file)
