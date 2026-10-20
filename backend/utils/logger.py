"""Centralized logging configuration.

Every module in the backend gets its logger from here so log formatting,
levels, and handlers stay consistent instead of each module configuring
its own (or worse, using bare `print`).
"""

from __future__ import annotations

import logging
import sys

_CONFIGURED = False


def _configure_root() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%H:%M:%S",
        )
    )

    root = logging.getLogger("smartmeme")
    root.setLevel(logging.INFO)
    root.addHandler(handler)
    root.propagate = False

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger, e.g. get_logger(__name__)."""
    _configure_root()
    return logging.getLogger(f"smartmeme.{name}")
