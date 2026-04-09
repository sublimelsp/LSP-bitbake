from __future__ import annotations

from lsp_utils import NpmClientHandler
import os


def plugin_loaded():
    LspBitbakefilePlugin.setup()


def plugin_unloaded():
    LspBitbakefilePlugin.cleanup()


class LspBitbakefilePlugin(NpmClientHandler):
    package_name = str(__package__)
    server_directory = "server"
    server_binary_path = os.path.join(
        server_directory, "node_modules", "language-server-bitbake", "out", "server.js"
    )
