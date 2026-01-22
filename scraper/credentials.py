"""Secure credential storage and retrieval."""

import os
from pathlib import Path
from typing import Optional

from cryptography.fernet import Fernet


class CredentialStore:
    """
    Secure credential storage with encryption.

    Credentials are encrypted at rest using Fernet symmetric encryption.
    The encryption key should be stored in ENCRYPTION_KEY env variable.

    Usage:
        store = CredentialStore()
        encrypted = store.encrypt("my_password")
        decrypted = store.decrypt(encrypted)
    """

    def __init__(self, key: Optional[str] = None):
        """
        Initialize credential store.

        Args:
            key: Fernet encryption key. If not provided, reads from
                 ENCRYPTION_KEY environment variable.

        Raises:
            ValueError: If no encryption key is available.
        """
        key = key or os.getenv("ENCRYPTION_KEY")
        if not key:
            raise ValueError(
                "ENCRYPTION_KEY not set. Generate one with: "
                "python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
            )
        self.fernet = Fernet(key.encode() if isinstance(key, str) else key)

    def encrypt(self, value: str) -> str:
        """
        Encrypt a string value.

        Args:
            value: Plain text to encrypt.

        Returns:
            Base64-encoded encrypted string.
        """
        return self.fernet.encrypt(value.encode()).decode()

    def decrypt(self, encrypted: str) -> str:
        """
        Decrypt an encrypted value.

        Args:
            encrypted: Base64-encoded encrypted string.

        Returns:
            Original plain text.
        """
        return self.fernet.decrypt(encrypted.encode()).decode()

    @staticmethod
    def generate_key() -> str:
        """
        Generate a new Fernet encryption key.

        Returns:
            Base64-encoded key string.
        """
        return Fernet.generate_key().decode()


class EnvironmentCredentials:
    """
    Read credentials from environment variables.

    Expected env vars:
        TRUCKTECH_USERNAME - Portal username
        TRUCKTECH_PASSWORD - Portal password
        TRUCKTECH_TOTP_SECRET - (Optional) TOTP secret for MFA
    """

    def __init__(self):
        self.username = os.getenv("TRUCKTECH_USERNAME")
        self.password = os.getenv("TRUCKTECH_PASSWORD")
        self.totp_secret = os.getenv("TRUCKTECH_TOTP_SECRET")

    def validate(self) -> bool:
        """Check if required credentials are present."""
        return bool(self.username and self.password)

    def __repr__(self) -> str:
        return f"EnvironmentCredentials(username={self.username!r}, has_password={bool(self.password)}, has_totp={bool(self.totp_secret)})"


class FileCredentials:
    """
    Read credentials from a JSON file.

    File format:
    {
        "username": "...",
        "password": "...",
        "totp_secret": "..."  // Optional
    }
    """

    def __init__(self, file_path: str = ".trucktech_credentials.json"):
        import json

        self.file_path = Path(file_path)
        self.username = None
        self.password = None
        self.totp_secret = None

        if self.file_path.exists():
            with open(self.file_path) as f:
                data = json.load(f)
                self.username = data.get("username")
                self.password = data.get("password")
                self.totp_secret = data.get("totp_secret")

    def validate(self) -> bool:
        """Check if required credentials are present."""
        return bool(self.username and self.password)

    def save(self, username: str, password: str, totp_secret: Optional[str] = None):
        """Save credentials to file."""
        import json

        data = {"username": username, "password": password}
        if totp_secret:
            data["totp_secret"] = totp_secret

        with open(self.file_path, "w") as f:
            json.dump(data, f, indent=2)

        # Set restrictive permissions
        self.file_path.chmod(0o600)


def get_credentials() -> tuple[str, str, Optional[str]]:
    """
    Get credentials from available sources.

    Checks in order:
    1. Environment variables
    2. Credentials file

    Returns:
        Tuple of (username, password, totp_secret or None)

    Raises:
        ValueError: If no valid credentials found.
    """
    # Try environment first
    env_creds = EnvironmentCredentials()
    if env_creds.validate():
        return env_creds.username, env_creds.password, env_creds.totp_secret

    # Try file
    file_creds = FileCredentials()
    if file_creds.validate():
        return file_creds.username, file_creds.password, file_creds.totp_secret

    raise ValueError(
        "No credentials found. Set TRUCKTECH_USERNAME and TRUCKTECH_PASSWORD "
        "environment variables, or create .trucktech_credentials.json file."
    )
