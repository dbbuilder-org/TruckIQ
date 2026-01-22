"""
TruckTech+ Scraper Client.

Automated data extraction from PACCAR Solutions portal (Decisiv SRM).
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page

from .errors import (
    LoginError,
    MFARequired,
    SessionExpired,
    ExtractionError,
)
from .models import VehicleData, FaultCodeData, SyncResult
from .mfa.totp import TOTPHandler


class TruckTechPlusScraper:
    """
    Scrape TruckTech+ data from PACCAR Solutions portal.

    Architecture (January 2026):
        - Portal: https://paccar.decisiv.net
        - Platform: Decisiv SRM v8.29.0
        - Auth: Username/Password (no MFA currently enforced)

    Usage:
        scraper = TruckTechPlusScraper(username, password)
        if scraper.login():
            vehicles = scraper.get_vehicles()
            for v in vehicles:
                v.faults = scraper.get_faults(v.vin)
        scraper.close()

    Or as context manager:
        with TruckTechPlusScraper(username, password) as scraper:
            if scraper.login():
                data = scraper.export_all_data()
    """

    LOGIN_URL = "https://paccar.decisiv.net/login"
    BASE_URL = "https://paccar.decisiv.net"
    SESSION_FILE = Path("session_storage.json")

    def __init__(
        self,
        username: str,
        password: str,
        totp_secret: Optional[str] = None,
        headless: Optional[bool] = None,
        session_file: Optional[Path] = None,
    ):
        """
        Initialize scraper.

        Args:
            username: TruckTech+ portal username.
            password: TruckTech+ portal password.
            totp_secret: Optional TOTP secret for MFA (future-proofing).
            headless: Run browser in headless mode. Defaults to HEADLESS env var or True.
            session_file: Path to store session cookies. Defaults to session_storage.json.
        """
        self.username = username
        self.password = password
        self.totp_handler = TOTPHandler(totp_secret) if totp_secret else None

        # Headless mode from env or param
        if headless is None:
            headless = os.getenv("HEADLESS", "true").lower() == "true"
        self.headless = headless

        if session_file:
            self.SESSION_FILE = session_file

        self._playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def _start_browser(self):
        """Initialize Playwright and browser."""
        if not self._playwright:
            self._playwright = sync_playwright().start()
            self.browser = self._playwright.chromium.launch(headless=self.headless)

    def _load_session(self) -> bool:
        """
        Try to reuse existing session.

        Returns:
            True if session is valid and loaded.
        """
        if not self.SESSION_FILE.exists():
            return False

        try:
            self.context = self.browser.new_context(
                storage_state=str(self.SESSION_FILE)
            )
            self.page = self.context.new_page()

            # Navigate to dashboard to test session
            self.page.goto(f"{self.BASE_URL}/dashboard")
            self.page.wait_for_load_state("networkidle", timeout=10000)

            # Check if we're actually logged in (not redirected to login)
            if "/login" not in self.page.url:
                print("  Reused existing session")
                return True

        except Exception as e:
            print(f"  Session load failed: {e}")

        # Clean up failed context
        if self.context:
            self.context.close()
            self.context = None
            self.page = None

        return False

    def _save_session(self):
        """Save session for reuse."""
        if self.context:
            self.context.storage_state(path=str(self.SESSION_FILE))
            print("  Session saved for reuse")

    def _new_context(self):
        """Create a fresh browser context."""
        self.context = self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        self.page = self.context.new_page()

    def _detect_mfa(self) -> Optional[str]:
        """
        Check if MFA prompt appeared.

        Returns:
            MFA type ('totp', 'sms', 'email') or None.
        """
        mfa_indicators = {
            'totp': ['input[name="code"]', 'input[placeholder*="authenticator"]'],
            'sms': ['text="text message"', 'text="SMS"'],
            'email': ['text="email"', 'text="verification code"'],
        }

        for mfa_type, selectors in mfa_indicators.items():
            for selector in selectors:
                try:
                    if self.page.query_selector(selector):
                        return mfa_type
                except Exception:
                    pass

        return None

    def _handle_mfa(self, mfa_type: str) -> bool:
        """
        Handle MFA challenge.

        Args:
            mfa_type: Type of MFA ('totp', 'sms', 'email').

        Returns:
            True if MFA completed successfully.

        Raises:
            MFARequired: If MFA cannot be handled automatically.
        """
        print(f"  MFA detected: {mfa_type}")

        if mfa_type == "totp" and self.totp_handler:
            code = self.totp_handler.get_code()
            print(f"  Entering TOTP code...")

            # Find and fill code input
            code_input = self.page.query_selector(
                'input[name="code"], input[placeholder*="code"]'
            )
            if code_input:
                code_input.fill(code)
                self.page.click('button[type="submit"]')

                try:
                    self.page.wait_for_url("**/dashboard**", timeout=10000)
                    return True
                except Exception:
                    print("  TOTP code rejected")
                    return False

        # No automatic handler available
        if not self.headless:
            print(f"  Complete MFA manually in browser (5 min timeout)...")
            try:
                self.page.wait_for_url("**/dashboard**", timeout=300000)
                self._save_session()
                return True
            except Exception:
                return False

        raise MFARequired(mfa_type)

    def login(self) -> bool:
        """
        Login to PACCAR Solutions portal.

        Current flow (no MFA as of Jan 2026):
        1. Navigate to login page
        2. Enter username/password
        3. Accept policies if prompted
        4. Wait for dashboard

        Returns:
            True if login successful.

        Raises:
            LoginError: If login fails.
        """
        self._start_browser()

        # Try existing session first
        print("Checking existing session...")
        if self._load_session():
            return True

        # Fresh login needed
        print("Logging in to PACCAR Solutions...")
        self._new_context()

        print(f"  Navigating to {self.LOGIN_URL}...")
        self.page.goto(self.LOGIN_URL)
        self.page.wait_for_load_state("networkidle")

        # Fill login form
        print("  Entering credentials...")
        self.page.fill("#auth_key", self.username)
        self.page.fill('input[type="password"]', self.password)

        # Click login button
        self.page.click('button[type="submit"]')

        # Wait for result with timeout
        try:
            # Wait for either dashboard or MFA/error
            self.page.wait_for_load_state("networkidle", timeout=15000)

            # Check for MFA
            mfa_type = self._detect_mfa()
            if mfa_type:
                if not self._handle_mfa(mfa_type):
                    raise LoginError("MFA verification failed")

            # Check if we're on dashboard
            if "/dashboard" in self.page.url or "/home" in self.page.url:
                print("  Login successful")
                self._save_session()
                return True

            # Check for error message
            error = self.page.query_selector(".error, .alert-danger, .error-message")
            if error:
                error_text = error.inner_text()
                raise LoginError(f"Login failed: {error_text}")

            # Check if still on login page
            if "/login" in self.page.url:
                raise LoginError("Login failed: Still on login page")

            # Unknown state but not login page - might be OK
            print(f"  Unexpected URL after login: {self.page.url}")
            self._save_session()
            return True

        except LoginError:
            raise
        except Exception as e:
            raise LoginError(f"Login failed: {e}")

    def get_vehicles(self) -> list[VehicleData]:
        """
        Extract vehicle list from portal.

        Returns:
            List of VehicleData objects.

        Raises:
            SessionExpired: If session is no longer valid.
            ExtractionError: If data extraction fails.
        """
        if not self.page:
            raise SessionExpired("Not logged in")

        print("Fetching vehicle list...")
        self.page.goto(f"{self.BASE_URL}/assets")

        try:
            self.page.wait_for_selector(
                "table tbody tr, .asset-list, .vehicle-list, .no-data",
                timeout=30000,
            )
        except Exception:
            # Check if redirected to login
            if "/login" in self.page.url:
                raise SessionExpired("Session expired")
            raise ExtractionError(self.page.url, "Timeout waiting for vehicle list")

        vehicles = []

        # Try table format first
        rows = self.page.query_selector_all("table tbody tr")
        if rows:
            for row in rows:
                cells = row.query_selector_all("td")
                if len(cells) >= 4:
                    vehicles.append(
                        VehicleData.from_table_row(
                            {
                                "vin": cells[0].inner_text().strip(),
                                "unit_number": cells[1].inner_text().strip(),
                                "year_make_model": cells[2].inner_text().strip(),
                                "status": cells[3].inner_text().strip(),
                            }
                        )
                    )

        # Try card/list format
        if not vehicles:
            cards = self.page.query_selector_all(".asset-card, .vehicle-card")
            for card in cards:
                vin_el = card.query_selector(".vin, [data-vin]")
                unit_el = card.query_selector(".unit-number, .unit")
                ymm_el = card.query_selector(".year-make-model, .vehicle-info")
                status_el = card.query_selector(".status")

                vehicles.append(
                    VehicleData.from_table_row(
                        {
                            "vin": vin_el.inner_text().strip() if vin_el else "",
                            "unit_number": unit_el.inner_text().strip() if unit_el else "",
                            "year_make_model": ymm_el.inner_text().strip() if ymm_el else "",
                            "status": status_el.inner_text().strip() if status_el else "",
                        }
                    )
                )

        print(f"  Found {len(vehicles)} vehicles")
        return vehicles

    def get_faults(self, vin: str) -> list[FaultCodeData]:
        """
        Extract fault codes for a specific vehicle.

        Args:
            vin: Vehicle VIN.

        Returns:
            List of FaultCodeData objects.
        """
        if not self.page:
            raise SessionExpired("Not logged in")

        self.page.goto(f"{self.BASE_URL}/assets/{vin}/diagnostics")

        try:
            self.page.wait_for_selector(
                ".fault-list, .dtc-table, table, .no-faults, .no-data",
                timeout=30000,
            )
        except Exception:
            if "/login" in self.page.url:
                raise SessionExpired("Session expired")
            # No faults or page structure unknown
            return []

        faults = []

        # Check for "no faults" message
        no_faults = self.page.query_selector(".no-faults, .no-data")
        if no_faults and "no" in no_faults.inner_text().lower():
            return []

        # Extract from table or list
        rows = self.page.query_selector_all(
            ".fault-row, .dtc-row, table tbody tr, .fault-item"
        )

        for row in rows:
            raw_text = row.inner_text()

            # Parse SPN/FMI from text
            # Patterns: "SPN 123 FMI 4", "SPN:123 FMI:4", "123/4"
            match = re.search(
                r"SPN[:\s]*(\d+).*?FMI[:\s]*(\d+)",
                raw_text,
                re.IGNORECASE,
            )
            if not match:
                # Try alternate format: "123/4"
                match = re.search(r"(\d{3,5})/(\d{1,2})", raw_text)

            if match:
                spn = int(match.group(1))
                fmi = int(match.group(2))

                # Determine if active
                is_active = True
                row_class = row.get_attribute("class") or ""
                if "inactive" in row_class.lower() or "historical" in row_class.lower():
                    is_active = False

                # Try to get severity
                severity = "unknown"
                if "critical" in row_class.lower() or "red" in row_class.lower():
                    severity = "critical"
                elif "warning" in row_class.lower() or "yellow" in row_class.lower():
                    severity = "major"
                elif "info" in row_class.lower() or "blue" in row_class.lower():
                    severity = "minor"

                faults.append(
                    FaultCodeData(
                        vin=vin,
                        spn=spn,
                        fmi=fmi,
                        is_active=is_active,
                        severity=severity,
                        description=raw_text[:500],  # Truncate long descriptions
                        raw_text=raw_text,
                    )
                )

        return faults

    def export_all_data(self, tenant_id: str = "default") -> SyncResult:
        """
        Export all vehicle and fault data.

        Args:
            tenant_id: Identifier for this sync operation.

        Returns:
            SyncResult with all extracted data.
        """
        result = SyncResult(tenant_id=tenant_id, started_at=datetime.now())

        try:
            vehicles = self.get_vehicles()
            result.vehicles_found = len(vehicles)

            for vehicle in vehicles:
                try:
                    vehicle.faults = self.get_faults(vehicle.vin)
                    result.faults_found += len(vehicle.faults)
                    result.critical_faults += sum(
                        1 for f in vehicle.faults if f.is_critical
                    )
                except Exception as e:
                    result.errors.append(f"Failed to get faults for {vehicle.vin}: {e}")

            result.success = True

        except Exception as e:
            result.errors.append(f"Sync failed: {e}")
            result.success = False

        result.completed_at = datetime.now()

        # Log summary
        print(f"\nSync completed in {result.duration_seconds:.1f}s")
        print(f"  Vehicles: {result.vehicles_found}")
        print(f"  Faults: {result.faults_found} ({result.critical_faults} critical)")
        if result.errors:
            print(f"  Errors: {len(result.errors)}")

        return result

    def close(self):
        """Clean up browser resources."""
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if self._playwright:
            self._playwright.stop()
