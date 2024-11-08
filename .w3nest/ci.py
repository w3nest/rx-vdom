from w3nest.app.environment import Environment
from w3nest.app.projects import IPipelineFactory, JsBundle, Link, Pipeline
from w3nest.ci.ts_frontend import (
    pipeline,
    PipelineConfig,
    PublishConfig,
)
from w3nest_client.context import Context


class PipelineFactory(IPipelineFactory):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def get(self, env: Environment, context: Context) -> Pipeline:
        config = PipelineConfig(
            target=JsBundle(
                links=[
                    Link(name="doc", url="dist/docs/modules.html"),
                    Link(name="coverage", url="coverage/lcov-report/index.html"),
                    Link(name="bundle-analysis", url="dist/bundle-analysis.html"),
                ]
            ),
            publishConfig=PublishConfig(packagedFolders=["./assets"]),
        )
        return await pipeline(config, context)
