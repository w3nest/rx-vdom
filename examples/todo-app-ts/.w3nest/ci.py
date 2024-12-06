from pathlib import Path

from w3nest.app.environment import Environment
from w3nest.app.projects import (
    BrowserApp,
    Execution,
    Link,
    BrowserAppGraphics,
    IPipelineFactory,
)
from w3nest.ci.ts_frontend import pipeline, PipelineConfig, PublishConfig
from w3nest.utils import parse_json, encode_id
from w3nest_client.context import Context

folder_path = Path(__file__).parent.parent
pkg_json = parse_json(folder_path / "package.json")
asset_id = encode_id(pkg_json['name'])
version = pkg_json['version']


class PipelineFactory(IPipelineFactory):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def get(self, _env: Environment, context: Context):
        config = PipelineConfig(target=BrowserApp(
            displayName="Todos",
            execution=Execution(
                standalone=True
            ),
            graphics=BrowserAppGraphics(
                appIcon={"class": "fas fa-check-circle fa-2x"}
            ),
            links=[
                Link(name="doc", url="dist/docs/index.html"),
                Link(name="coverage", url="coverage/lcov-report/index.html"),
                Link(name="bundle-analysis", url="dist/bundle-analysis.html")
            ]
        ),
            publishConfig=PublishConfig(
                packagedFolders=["assets"],
            ))
        return await pipeline(config, context)
