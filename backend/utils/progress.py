"""Progress bar helper with a graceful fallback.

tqdm is a nice-to-have (progress bars during long scans), not a hard
requirement for correctness. If it isn't installed, `progress_iter` falls
back to a plain pass-through iterator so the pipeline still runs — it just
prints less.
"""

from __future__ import annotations

from typing import Iterable, Iterator, TypeVar

T = TypeVar("T")

try:
    from tqdm import tqdm as _tqdm

    _HAS_TQDM = True
except ImportError:
    _HAS_TQDM = False


def progress_iter(iterable: Iterable[T], *, desc: str = "", total: int | None = None) -> Iterator[T]:
    if _HAS_TQDM:
        return _tqdm(iterable, desc=desc, total=total, unit="img")
    return iter(iterable)


def tqdm_available() -> bool:
    return _HAS_TQDM
