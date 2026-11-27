"""Wrapper de execução do pipeline incremental de ingestão."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from bula_clara.pipeline_ingestao import main

if __name__ == "__main__":
    raise SystemExit(main())
