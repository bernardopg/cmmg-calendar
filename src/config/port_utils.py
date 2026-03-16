"""
Helpers to normalize and resolve local runtime ports.
"""

from __future__ import annotations

import argparse
import socket


def parse_port(value: object, default: int) -> int:
    """Converts an arbitrary value to a valid TCP port."""

    try:
        port = int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return default

    if 0 <= port <= 65535:
        return port
    return default


def is_port_available(port: int, host: str = "127.0.0.1") -> bool:
    """Checks whether a TCP port can be bound on the given host."""

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
        except OSError:
            return False
    return True


def find_available_port(
    preferred_port: int,
    host: str = "127.0.0.1",
    max_attempts: int = 200,
) -> int:
    """Finds the first free port starting from the preferred value."""

    normalized_port = parse_port(preferred_port, 0)

    if normalized_port == 0:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.bind((host, 0))
            return int(sock.getsockname()[1])

    for candidate in range(normalized_port, normalized_port + max_attempts):
        if is_port_available(candidate, host):
            return candidate

    raise RuntimeError(
        f"Nenhuma porta disponível encontrada a partir de {normalized_port} em {host}"
    )


def resolve_runtime_port(
    preferred_port: int,
    host: str = "127.0.0.1",
    max_attempts: int = 200,
) -> tuple[int, bool]:
    """Returns a usable port and whether the preferred value had to change."""

    normalized_port = parse_port(preferred_port, 0)
    resolved_port = find_available_port(
        preferred_port=normalized_port,
        host=host,
        max_attempts=max_attempts,
    )
    return resolved_port, resolved_port != normalized_port


def main() -> None:
    """Simple CLI to reuse the resolver from shell scripts."""

    parser = argparse.ArgumentParser(description="Resolve uma porta TCP livre.")
    parser.add_argument(
        "--preferred-port",
        type=int,
        default=5000,
        help="Porta preferida para iniciar a busca.",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host/interface usado na verificação de bind.",
    )
    parser.add_argument(
        "--max-attempts",
        type=int,
        default=200,
        help="Quantidade máxima de portas consecutivas a testar.",
    )
    args = parser.parse_args()

    print(
        find_available_port(
            preferred_port=args.preferred_port,
            host=args.host,
            max_attempts=args.max_attempts,
        )
    )


if __name__ == "__main__":
    main()
