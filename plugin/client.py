from __future__ import annotations

import os
from collections.abc import Callable
from typing import final

import sublime
from LSP.plugin import ClientConfig, Session
from lsp_utils import ApiWrapperInterface, NpmClientHandler, request_handler
from typing_extensions import override

from .constants import PACKAGE_NAME
from .data_types import CustomDataChangedNotification, CustomDataRequest


@final
class LspBitbakePlugin(NpmClientHandler):
    package_name = PACKAGE_NAME
    server_directory = "language-server"
    server_binary_path = os.path.join(
        server_directory,
        "bitbake-language-features",
        "server",
        "package",
        "out",
        "server.js",
    )

    @override
    @classmethod
    def required_node_version(cls) -> str:
        return ">=14"

    @override
    @classmethod
    def is_applicable(cls, view: sublime.View, config: ClientConfig) -> bool:
        return bool(
            super().is_applicable(view, config)
            # REPL views (https://github.com/sublimelsp/LSP-pyright/issues/343)
            and not view.settings().get("repl")
        )

    @override
    def on_ready(self, api: ApiWrapperInterface) -> None:
        session = self.weaksession()
        if not session:
            return
