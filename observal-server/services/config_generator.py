import re

from models.mcp import McpListing

_SAFE_NAME = re.compile(r'^[a-zA-Z0-9_-]+$')


def _sanitize_name(name: str) -> str:
    if _SAFE_NAME.match(name):
        return name
    return re.sub(r'[^a-zA-Z0-9_-]', '-', name)


def generate_config(listing: McpListing, ide: str) -> dict:
    name = _sanitize_name(listing.name)
    if ide in ("cursor", "vscode"):
        return {"mcpServers": {name: {"command": "python", "args": ["-m", name], "env": {}}}}
    if ide == "kiro":
        return {"mcpServers": {name: {"command": "python", "args": ["-m", name], "env": {}}}}
    if ide == "claude-code":
        # Use list format, not shell string
        return {"command": ["claude", "mcp", "add", name, "--", "python", "-m", name], "type": "shell_command"}
    if ide == "gemini-cli":
        return {"mcpServers": {name: {"command": "python", "args": ["-m", name]}}}
    return {"mcpServers": {name: {"command": "python", "args": ["-m", name], "env": {}}}}
