from w3nest.app.environment import Environment
from w3nest.app.projects import (BrowserApp, BrowserAppGraphics,
                                         Execution, IPipelineFactory)
from w3nest.ci.js_app import PipelineConfig, pipeline
from w3nest.utils import Context


class PipelineFactory(IPipelineFactory):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def get(self, _env: Environment, ctx: Context):
        config = PipelineConfig(
            target=BrowserApp(
                displayName="Todos",
                execution=Execution(standalone=True),
                graphics=BrowserAppGraphics(
                    appIcon={"class": "fas fa-check-circle fa-2x"}, fileIcon={}
                ),
            ),
            withTags=["javascript", "application"],
        )
        return await pipeline(config=config, context=ctx)
