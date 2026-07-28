"""Dump the FastAPI OpenAPI schema to a file without running the server.

Usage:
    uv run python scripts/export_openapi.py [output_path]

Defaults to writing ./openapi.json. The app's client generator
(`@hey-api/openapi-ts`) reads this file to produce the typed TanStack Query client.
"""

import json
import sys
from pathlib import Path

# Ensure the server package root (parent of scripts/) is importable.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("openapi.json")
    schema = app.openapi()
    out.write_text(json.dumps(schema, indent=2) + "\n")
    print(f"Wrote {out} ({len(schema.get('paths', {}))} paths)")


if __name__ == "__main__":
    main()
