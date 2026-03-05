import os
from lsp_utils import NpmClientHandler


def plugin_loaded():
    LspBitbakefilePlugin.setup()


def plugin_unloaded():
    LspBitbakefilePlugin.cleanup()


class LspBitbakefilePlugin(NpmClientHandler):
    package_name = __package__
    server_directory = "server"
    server_binary_path = os.path.join(
        server_directory, "node_modules", "language-server-bitbake", "out", "server.js"
    )
