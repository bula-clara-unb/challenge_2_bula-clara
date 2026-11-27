"""Wrapper de CLI para o catálogo oficial de medicamentos e fila incremental."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from bula_clara.catalogo import main

if __name__ == "__main__":
    raise SystemExit(main())
