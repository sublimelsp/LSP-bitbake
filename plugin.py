from __future__ import annotations

from LSP.plugin import LspPlugin
from LSP.plugin import OnPreStartContext
from lsp_utils import NodeManager
from pathlib import Path
from sublime_lib import ResourcePath
from typing_extensions import override


def plugin_loaded():
    LspBitbakefilePlugin.register()


def plugin_unloaded():
    LspBitbakefilePlugin.unregister()


class LspBitbakefilePlugin(LspPlugin):

    @classmethod
    @override
    def on_pre_start_async(cls, context: OnPreStartContext) -> None:
        package_name = cls.plugin_storage_path.name
        NodeManager.on_pre_start_async(
            context,
            cls.plugin_storage_path,
            ResourcePath('Packages', package_name, 'server'),
            Path('node_modules', 'language-server-bitbake', 'out', 'server.js'),
            node_version_requirement='>=18',
        )

