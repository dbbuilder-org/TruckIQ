# TruckIQ AI - Data Integration Specification

**Version:** 2.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Overview

This document specifies the data integration strategy for TruckIQ AI, focusing on automated data synchronization from TruckTech+ via the PACCAR Solutions portal (powered by Decisiv SRM).

---

## Architecture Discovery (January 2026)

### Key Finding: PACCAR Solutions Runs on Decisiv

| Component | Details |
|-----------|---------|
| **Portal URL** | https://paccar.decisiv.net/login |
| **Platform** | Decisiv SRM v8.29.0 |
| **API Documentation** | https://api-docs.decisiv.net/ |
| **Authentication** | Username/Password (no MFA currently enforced) |
| **Session Duration** | ~24 hours (estimated) |

### Portal Source Analysis

Analysis of the login page source revealed:

```
✓ Simple username/password form (field: #auth_key)
✓ No MFA/2FA references in frontend code
✓ No third-party auth providers (Okta, Auth0, Azure AD)
✓ No OAuth/SSO visible in frontend
✓ Legacy Google Analytics (older infrastructure)
✓ Policies & Agreements acceptance required
```

**Implication:** Current automation is straightforward - no MFA handling required (as of January 2026). However, MFA support should be built in for future-proofing.

---

## Integration Approaches (Priority Order)

### Approach 1: Decisiv SRM Connect APIs (Recommended)

Since PACCAR Solutions runs on Decisiv, the [SRM Connect APIs](https://api-docs.decisiv.net/) may provide direct data access without web scraping:

```python
import requests

class DecisivAPIClient:
    """Direct API access to Decisiv SRM platform."""

    BASE_URL = "https://api.decisiv.net/v1"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self._token = None

    def authenticate(self) -> str:
        """Get OAuth token from Decisiv."""
        response = requests.post(
            f"{self.BASE_URL}/oauth/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            }
        )
        response.raise_for_status()
        self._token = response.json()["access_token"]
        return self._token

    def get_vehicles(self) -> list[dict]:
        """Fetch vehicle list via API."""
        response = requests.get(
            f"{self.BASE_URL}/assets",
            headers={"Authorization": f"Bearer {self._token}"}
        )
        response.raise_for_status()
        return response.json()["data"]

    def get_service_cases(self, asset_id: str) -> list[dict]:
        """Fetch service cases (includes fault codes) for an asset."""
        response = requests.get(
            f"{self.BASE_URL}/assets/{asset_id}/cases",
            headers={"Authorization": f"Bearer {self._token}"}
        )
        response.raise_for_status()
        return response.json()["data"]
```

**Action Required:** Contact PACCAR/Decisiv to obtain API credentials for your dealer account.

### Approach 2: Web Scraping (Current Implementation)

For immediate use without API access:

```python
from playwright.sync_api import sync_playwright
import json
from pathlib import Path

class TruckTechPlusScraper:
    """
    Scrape TruckTech+ data from PACCAR Solutions portal.

    Current state (Jan 2026): No MFA required - simple login flow.
    """

    LOGIN_URL = "https://paccar.decisiv.net/login"
    SESSION_FILE = Path("session_storage.json")

    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self.browser = None
        self.context = None
        self.page = None

    def _load_session(self) -> bool:
        """Try to reuse existing session."""
        if self.SESSION_FILE.exists():
            try:
                self.context = self.browser.new_context(
                    storage_state=str(self.SESSION_FILE)
                )
                self.page = self.context.new_page()
                self.page.goto("https://paccar.decisiv.net/dashboard")

                # Check if we're actually logged in
                if "/login" not in self.page.url:
                    print("✓ Reused existing session")
                    return True
            except Exception:
                pass
        return False

    def _save_session(self):
        """Save session for reuse."""
        self.context.storage_state(path=str(self.SESSION_FILE))
        print("✓ Session saved for reuse")

    def login(self) -> bool:
        """
        Login to PACCAR Solutions portal.

        Current flow (no MFA):
        1. Navigate to login page
        2. Enter username/password
        3. Accept policies if prompted
        4. Wait for dashboard
        """
        playwright = sync_playwright().start()
        self.browser = playwright.chromium.launch(headless=True)

        # Try existing session first
        if self._load_session():
            return True

        # Fresh login needed
        self.context = self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        self.page = self.context.new_page()

        print(f"Navigating to {self.LOGIN_URL}...")
        self.page.goto(self.LOGIN_URL)
        self.page.wait_for_load_state("networkidle")

        # Fill login form
        print("Entering credentials...")
        self.page.fill("#auth_key", self.username)
        self.page.fill('input[type="password"]', self.password)

        # Click login button
        self.page.click('button[type="submit"]')

        # Wait for result
        try:
            # Success - redirected to dashboard
            self.page.wait_for_url("**/dashboard**", timeout=15000)
            print("✓ Login successful")
            self._save_session()
            return True

        except Exception:
            # Check for MFA prompt (future-proofing)
            if self._detect_mfa():
                return self._handle_mfa()

            # Check for error message
            error = self.page.query_selector(".error, .alert-danger")
            if error:
                print(f"✗ Login failed: {error.inner_text()}")
            return False

    def _detect_mfa(self) -> bool:
        """Check if MFA prompt appeared."""
        mfa_indicators = [
            'input[name="code"]',
            'input[placeholder*="code"]',
            'text="verification"',
            'text="two-factor"',
        ]
        for indicator in mfa_indicators:
            if self.page.query_selector(indicator):
                return True
        return False

    def _handle_mfa(self) -> bool:
        """
        Handle MFA if it's enabled in the future.

        Options:
        1. TOTP (Authenticator app) - generate code with pyotp
        2. SMS - read via Twilio or Google Voice + Gmail API
        3. Email - read via IMAP/Gmail API
        """
        print("⚠ MFA detected - not implemented yet")
        print("  Run with HEADLESS=false to complete manually")

        # Wait for manual completion (5 min timeout)
        try:
            self.page.wait_for_url("**/dashboard**", timeout=300000)
            self._save_session()
            return True
        except Exception:
            return False

    def get_vehicles(self) -> list[dict]:
        """Extract vehicle list from portal."""
        self.page.goto("https://paccar.decisiv.net/assets")
        self.page.wait_for_selector("table tbody tr, .asset-list")

        vehicles = []
        rows = self.page.query_selector_all("table tbody tr")

        for row in rows:
            cells = row.query_selector_all("td")
            if len(cells) >= 4:
                vehicles.append({
                    "vin": cells[0].inner_text().strip(),
                    "unit_number": cells[1].inner_text().strip(),
                    "year_make_model": cells[2].inner_text().strip(),
                    "status": cells[3].inner_text().strip(),
                })

        return vehicles

    def get_faults(self, vin: str) -> list[dict]:
        """Extract fault codes for a specific vehicle."""
        self.page.goto(f"https://paccar.decisiv.net/assets/{vin}/diagnostics")
        self.page.wait_for_selector(".fault-list, .dtc-table, .no-faults")

        faults = []
        rows = self.page.query_selector_all(".fault-row, .dtc-row, table tbody tr")

        for row in rows:
            fault_text = row.inner_text()
            # Parse SPN/FMI from text
            import re
            match = re.search(r'SPN[:\s]*(\d+).*?FMI[:\s]*(\d+)', fault_text, re.I)
            if match:
                faults.append({
                    "spn": int(match.group(1)),
                    "fmi": int(match.group(2)),
                    "description": fault_text,
                    "is_active": "active" in row.get_attribute("class").lower(),
                })

        return faults

    def export_all_data(self) -> dict:
        """Export all vehicle and fault data."""
        vehicles = self.get_vehicles()

        for vehicle in vehicles:
            vehicle["faults"] = self.get_faults(vehicle["vin"])

        return {
            "exported_at": datetime.now().isoformat(),
            "vehicle_count": len(vehicles),
            "vehicles": vehicles,
        }

    def close(self):
        """Clean up browser resources."""
        if self.browser:
            self.browser.close()
```

---

## MFA Handling (Future-Proofing)

If PACCAR enables MFA in the future, here are the automation options:

### Option 1: TOTP (Authenticator App) - Recommended

```python
import pyotp

class TOTPHandler:
    """Generate TOTP codes for authenticator-based MFA."""

    def __init__(self, secret: str):
        """
        Initialize with base32 secret.

        To get secret: During MFA setup, click "Can't scan QR code?"
        to reveal the manual entry key.
        """
        self.totp = pyotp.TOTP(secret)

    def get_code(self) -> str:
        """Generate current 6-digit code."""
        return self.totp.now()

    def verify_setup(self) -> bool:
        """Verify the secret is valid."""
        try:
            code = self.get_code()
            return len(code) == 6 and code.isdigit()
        except Exception:
            return False
```

**Pros:** Instant, free, most reliable
**Cons:** Need to capture secret during initial setup

### Option 2: SMS via Twilio - Simplest for SMS MFA

```python
from twilio.rest import Client
import re
import time

class TwilioSMSHandler:
    """
    Receive SMS MFA codes via Twilio.

    Setup:
    1. Sign up at twilio.com
    2. Get a phone number (~$1/month)
    3. Use that number for MFA enrollment
    """

    def __init__(self, account_sid: str, auth_token: str, phone_number: str):
        self.client = Client(account_sid, auth_token)
        self.phone_number = phone_number

    def get_latest_code(self, timeout: int = 60) -> str:
        """
        Wait for and retrieve MFA code from SMS.

        Returns 6-digit code or raises TimeoutError.
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            messages = self.client.messages.list(
                to=self.phone_number,
                limit=1
            )

            if messages:
                latest = messages[0]
                # Only use recent messages (last 2 minutes)
                if (datetime.now() - latest.date_sent).seconds < 120:
                    match = re.search(r'\b(\d{6})\b', latest.body)
                    if match:
                        return match.group(1)

            time.sleep(2)

        raise TimeoutError("No MFA code received within timeout")
```

**Cost:** ~$1/month for phone number + $0.0079/SMS received
**Setup time:** 5 minutes

### Option 3: Email MFA via Gmail API

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import re

class GmailMFAHandler:
    """Read MFA codes from email via Gmail API."""

    def __init__(self, credentials_file: str):
        creds = Credentials.from_authorized_user_file(credentials_file)
        self.service = build('gmail', 'v1', credentials=creds)

    def get_latest_code(self, sender: str = "noreply@decisiv.net") -> str:
        """Retrieve MFA code from recent email."""
        results = self.service.users().messages().list(
            userId='me',
            q=f'from:{sender} newer_than:2m',
            maxResults=1
        ).execute()

        if results.get('messages'):
            msg = self.service.users().messages().get(
                userId='me',
                id=results['messages'][0]['id']
            ).execute()

            # Extract code from body
            body = msg.get('snippet', '')
            match = re.search(r'\b(\d{6})\b', body)
            if match:
                return match.group(1)

        raise ValueError("No MFA code found in recent emails")
```

---

## Data Models

### Extracted Vehicle Data

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class VehicleData:
    vin: str
    unit_number: str
    year: int
    make: str
    model: str
    engine_make: Optional[str] = None
    engine_model: Optional[str] = None
    odometer: Optional[int] = None
    engine_hours: Optional[int] = None
    last_location: Optional[dict] = None  # {lat, lng}

@dataclass
class FaultCodeData:
    vin: str
    spn: int
    fmi: int
    source_address: int = 0
    description: str = ""
    severity: str = "unknown"  # critical, major, minor, info
    is_active: bool = True
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    occurrence_count: int = 1
```

---

## Sync Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA SYNC WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CHECK SESSION                                                            │
│     ┌─────────────────┐                                                      │
│     │ Load saved      │──── Valid? ────► Skip to step 3                     │
│     │ session cookies │                                                      │
│     └────────┬────────┘                                                      │
│              │ Expired/Missing                                               │
│              ▼                                                               │
│  2. LOGIN                                                                    │
│     ┌─────────────────┐                                                      │
│     │ Enter username  │                                                      │
│     │ Enter password  │                                                      │
│     │ Submit form     │                                                      │
│     └────────┬────────┘                                                      │
│              │                                                               │
│              ▼                                                               │
│     ┌─────────────────┐                                                      │
│     │ MFA Required?   │──── No ────► Save session, continue                 │
│     └────────┬────────┘                                                      │
│              │ Yes                                                           │
│              ▼                                                               │
│     ┌─────────────────┐                                                      │
│     │ Generate/Get    │  TOTP: pyotp.TOTP(secret).now()                     │
│     │ MFA code        │  SMS:  twilio.messages.list()[0]                    │
│     │ Submit code     │  Email: gmail.messages.list()[0]                    │
│     └────────┬────────┘                                                      │
│              │                                                               │
│              ▼                                                               │
│  3. EXTRACT DATA                                                             │
│     ┌─────────────────┐                                                      │
│     │ Get vehicle     │  Navigate to /assets                                │
│     │ list            │  Parse table rows                                   │
│     └────────┬────────┘                                                      │
│              │                                                               │
│              ▼                                                               │
│     ┌─────────────────┐                                                      │
│     │ For each        │  Navigate to /assets/{vin}/diagnostics              │
│     │ vehicle, get    │  Parse fault codes                                  │
│     │ fault codes     │  Note: Parallelize for speed                        │
│     └────────┬────────┘                                                      │
│              │                                                               │
│              ▼                                                               │
│  4. PERSIST DATA                                                             │
│     ┌─────────────────┐                                                      │
│     │ Upsert vehicles │  ON CONFLICT (vin) DO UPDATE                        │
│     │ Upsert faults   │  Track occurrence_count                             │
│     │ Update health   │  Recalculate health scores                          │
│     └────────┬────────┘                                                      │
│              │                                                               │
│              ▼                                                               │
│  5. GENERATE ALERTS                                                          │
│     ┌─────────────────┐                                                      │
│     │ New critical    │  Create alert records                               │
│     │ faults?         │  Send notifications                                 │
│     │ Risk changes?   │  Trigger webhooks                                   │
│     └─────────────────┘                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Scheduling

### Render Cron Job Configuration

```yaml
# render.yaml
services:
  - type: cron
    name: truckiq-sync
    runtime: python
    plan: starter  # $7/month, includes 512MB RAM
    buildCommand: pip install -r requirements.txt && playwright install chromium
    schedule: "*/15 * * * *"  # Every 15 minutes
    command: python -m scraper.sync --all-tenants
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: truckiq-db
          property: connectionString
      - key: ENCRYPTION_KEY
        sync: false
      - key: HEADLESS
        value: "true"
```

### Local Development

```bash
# Run once for specific tenant
python -m scraper.sync --tenant acme-trucking

# Run with visible browser for debugging
HEADLESS=false python -m scraper.sync --tenant acme-trucking

# Check sync status
python -m scraper.status
```

---

## Error Handling

```python
class SyncError(Exception):
    """Base sync error."""
    pass

class LoginError(SyncError):
    """Login failed."""
    pass

class MFARequired(SyncError):
    """MFA is required but not configured."""
    pass

class SessionExpired(SyncError):
    """Session has expired, re-login needed."""
    pass

class RateLimited(SyncError):
    """Too many requests, back off."""
    def __init__(self, retry_after: int = 300):
        self.retry_after = retry_after
        super().__init__(f"Rate limited, retry after {retry_after}s")
```

### Retry Strategy

```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=lambda e: isinstance(e, (SessionExpired, RateLimited))
)
async def sync_with_retry(scraper: TruckTechPlusScraper, tenant_id: str):
    """Sync with automatic retry on transient failures."""
    try:
        return await scraper.export_all_data()
    except SessionExpired:
        scraper.login()  # Re-authenticate
        raise  # Trigger retry
    except RateLimited as e:
        await asyncio.sleep(e.retry_after)
        raise  # Trigger retry
```

---

## Security Considerations

### Credential Storage

```python
from cryptography.fernet import Fernet
import os

class CredentialStore:
    """Secure credential storage with encryption."""

    def __init__(self):
        key = os.getenv("ENCRYPTION_KEY")
        if not key:
            raise ValueError("ENCRYPTION_KEY not set")
        self.fernet = Fernet(key.encode())

    def encrypt(self, value: str) -> str:
        return self.fernet.encrypt(value.encode()).decode()

    def decrypt(self, encrypted: str) -> str:
        return self.fernet.decrypt(encrypted.encode()).decode()
```

### Database Schema for Credentials

```sql
CREATE TABLE sync_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider VARCHAR(50) NOT NULL DEFAULT 'trucktech_plus',
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,
    totp_secret_encrypted TEXT,  -- Optional, for MFA
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, provider)
);

-- RLS policy: tenants can only see their own credentials
ALTER TABLE sync_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_credentials ON sync_credentials
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## Monitoring & Alerting

### Health Checks

```python
async def check_sync_health() -> dict:
    """Check overall sync system health."""
    return {
        "browser": await browser_manager.health_check(),
        "database": await db.health_check(),
        "last_successful_sync": await db.get_last_successful_sync(),
        "failed_syncs_24h": await db.count_failed_syncs(hours=24),
        "stale_tenants": await db.get_stale_tenants(hours=6),
    }
```

### Alerts via Resend

```python
from resend import Resend

resend = Resend(os.getenv("RESEND_API_KEY"))

async def send_sync_alert(subject: str, message: str):
    """Send alert email."""
    resend.emails.send({
        "from": "TruckIQ Alerts <alerts@truckiq.ai>",
        "to": [os.getenv("ALERT_EMAIL")],
        "subject": f"[TruckIQ Sync] {subject}",
        "html": f"<p>{message}</p>",
    })
```

---

## References

- [PACCAR Solutions Portal](https://paccar.decisiv.net/login) - Main login
- [Decisiv API Documentation](https://api-docs.decisiv.net/) - SRM Connect APIs
- [Decisiv Platform](https://www.decisiv.com/) - Platform overview
- [Playwright Documentation](https://playwright.dev/python/) - Browser automation
- [pyotp Documentation](https://pyauth.github.io/pyotp/) - TOTP generation
- [Twilio SMS API](https://www.twilio.com/docs/sms) - SMS MFA option
