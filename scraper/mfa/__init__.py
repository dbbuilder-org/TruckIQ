"""MFA handlers for TruckTech+ authentication."""

from .totp import TOTPHandler

__all__ = ["TOTPHandler"]
