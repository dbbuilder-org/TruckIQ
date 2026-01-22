"""Custom exceptions for TruckTech+ scraper."""


class SyncError(Exception):
    """Base sync error."""

    pass


class LoginError(SyncError):
    """Login failed - invalid credentials or unexpected response."""

    pass


class MFARequired(SyncError):
    """MFA is required but not configured for automation."""

    def __init__(self, mfa_type: str = "unknown"):
        self.mfa_type = mfa_type
        super().__init__(
            f"MFA ({mfa_type}) is required but not configured. "
            "Run with HEADLESS=false to complete manually, or configure MFA handler."
        )


class SessionExpired(SyncError):
    """Session has expired, re-login needed."""

    pass


class RateLimited(SyncError):
    """Too many requests, back off."""

    def __init__(self, retry_after: int = 300):
        self.retry_after = retry_after
        super().__init__(f"Rate limited, retry after {retry_after}s")


class ExtractionError(SyncError):
    """Failed to extract data from page."""

    def __init__(self, page_url: str, detail: str = ""):
        self.page_url = page_url
        self.detail = detail
        super().__init__(f"Failed to extract data from {page_url}: {detail}")
