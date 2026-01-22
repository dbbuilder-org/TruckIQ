"""TOTP (Time-based One-Time Password) handler for MFA automation."""

import pyotp


class TOTPHandler:
    """
    Generate TOTP codes for authenticator-based MFA.

    Usage:
        handler = TOTPHandler("JBSWY3DPEHPK3PXP")  # Base32 secret
        code = handler.get_code()  # Returns current 6-digit code

    To get the secret:
        During MFA setup, click "Can't scan QR code?" to reveal
        the manual entry key (base32 encoded secret).
    """

    def __init__(self, secret: str):
        """
        Initialize with base32 secret.

        Args:
            secret: Base32 encoded secret from authenticator setup.
                    Remove spaces if present.
        """
        # Clean up secret (remove spaces, uppercase)
        clean_secret = secret.replace(" ", "").upper()
        self.totp = pyotp.TOTP(clean_secret)

    def get_code(self) -> str:
        """
        Generate current 6-digit TOTP code.

        Returns:
            6-digit string code valid for ~30 seconds.
        """
        return self.totp.now()

    def verify_setup(self) -> bool:
        """
        Verify the secret is valid and generating codes.

        Returns:
            True if secret is valid and generating proper codes.
        """
        try:
            code = self.get_code()
            return len(code) == 6 and code.isdigit()
        except Exception:
            return False

    def get_time_remaining(self) -> int:
        """
        Get seconds remaining until current code expires.

        Returns:
            Seconds until code rotation (0-30).
        """
        import time

        return 30 - int(time.time()) % 30

    def verify_code(self, code: str) -> bool:
        """
        Verify a code against current TOTP.

        Args:
            code: 6-digit code to verify.

        Returns:
            True if code is valid for current or adjacent time window.
        """
        return self.totp.verify(code, valid_window=1)
