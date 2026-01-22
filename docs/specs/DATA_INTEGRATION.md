# TruckIQ AI - Data Integration Specification

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Overview

This document specifies the data integration strategy for TruckIQ AI, focusing on automated data synchronization from TruckTech+ (PACCAR Solutions portal) with MFA handling based on proven patterns from the AestheticIQ project.

---

## TruckTech+ Data Source

### Portal Information

| Attribute | Value |
|-----------|-------|
| **Portal URL** | https://paccarsolutions.com or https://paccar.decisiv.net |
| **Authentication** | Email/Password + MFA (TOTP or SMS) |
| **Session Duration** | ~24 hours |
| **Rate Limits** | Unknown (implement conservative defaults) |
| **Data Refresh** | Near real-time for active faults |

### Available Data

Based on research, TruckTech+ provides access to:

| Data Type | Availability | Priority |
|-----------|--------------|----------|
| Vehicle identification (VIN, year, make, model) | High | MVP |
| Active fault codes (SPN, FMI, SA) | High | MVP |
| Fault code history | Medium | MVP |
| Current odometer | High | MVP |
| Engine hours | High | MVP |
| GPS location | Medium | Post-MVP |
| Service history | Via Decisiv SRM | Post-MVP |
| Warranty status | Medium | Post-MVP |

---

## Authentication Strategy

### MFA Handling Approaches

Based on the AestheticIQ implementation, we support two approaches:

#### Approach A: Automated TOTP (Recommended)

When TOTP-based MFA is enabled on the TruckTech+ account:

1. **Extract TOTP Secret**: During initial MFA setup, capture the manual entry key (not just QR code)
2. **Store Encrypted**: Save base32-encoded TOTP secret in `sync_credentials` table
3. **Generate Codes**: Python generates 6-digit TOTP codes automatically
4. **Submit Automatically**: Browser automation enters code without human intervention

```python
# Example TOTP generation (from AestheticIQ pattern)
import hmac
import hashlib
import struct
import time
import base64

def generate_totp(secret: str, interval: int = 30) -> str:
    """Generate TOTP code from secret."""
    # Decode base32 secret
    key = base64.b32decode(secret.upper())

    # Get current time step
    counter = int(time.time() // interval)

    # Generate HMAC-SHA1
    counter_bytes = struct.pack('>Q', counter)
    hmac_hash = hmac.new(key, counter_bytes, hashlib.sha1).digest()

    # Dynamic truncation
    offset = hmac_hash[-1] & 0x0F
    code = struct.unpack('>I', hmac_hash[offset:offset + 4])[0]
    code = (code & 0x7FFFFFFF) % 1000000

    return f'{code:06d}'
```

#### Approach B: Session Persistence (Fallback)

For accounts using SMS/email MFA:

1. **Manual First Login**: Run sync with `HEADLESS=false` for initial MFA completion
2. **Save Session**: Browser context persisted after successful login
3. **Reuse Session**: Subsequent runs skip MFA until session expires (~24 hours)
4. **Monitor Expiry**: Alert when session refresh is needed

### Credential Storage

```python
# Encrypted credential model
class SyncCredential:
    tenant_id: UUID
    provider: str = "trucktech_plus"
    username: str
    password_enc: str      # AES-256 encrypted
    totp_secret_enc: str   # AES-256 encrypted (optional)

# Encryption using Fernet (AES-128-CBC)
from cryptography.fernet import Fernet

def encrypt_credential(value: str, key: bytes) -> str:
    f = Fernet(key)
    return f.encrypt(value.encode()).decode()

def decrypt_credential(encrypted: str, key: bytes) -> str:
    f = Fernet(key)
    return f.decrypt(encrypted.encode()).decode()
```

---

## Browser Automation Architecture

### Tiered Browser Strategy

Following AestheticIQ's proven approach:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER SELECTION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐                                                    │
│  │   Try Camoufox      │  Anti-detection browser with realistic            │
│  │   (Primary)         │  fingerprints, WebRTC blocking                     │
│  └──────────┬──────────┘                                                    │
│             │                                                               │
│             ▼ fails?                                                        │
│  ┌─────────────────────┐                                                    │
│  │  Try Playwright     │  Standard Firefox without anti-detect              │
│  │  Firefox (Fallback) │  features                                          │
│  └──────────┬──────────┘                                                    │
│             │                                                               │
│             ▼ fails?                                                        │
│  ┌─────────────────────┐                                                    │
│  │  Try Playwright     │  Last resort, most detectable                      │
│  │  Chromium           │                                                    │
│  └─────────────────────┘                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Browser Configuration

```python
# Browser manager configuration
class BrowserConfig:
    user_agent: str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    viewport: dict = {"width": 1920, "height": 1080}
    timezone: str = "America/Chicago"
    locale: str = "en-US"
    hardware_concurrency: int = 8

    # Anti-detection settings
    block_webrtc: bool = True
    humanize_delays: tuple = (0.5, 1.5)  # Random delay range (seconds)

    # Proxy settings (optional)
    proxy_url: str = None  # e.g., "http://user:pass@proxy:port"
    rotate_session: bool = True  # New proxy session per sync
```

### Browser Manager Implementation

```python
# services/sync/src/browser.py

import asyncio
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from typing import Optional
import random

class BrowserManager:
    def __init__(self, config: BrowserConfig):
        self.config = config
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None

    async def get_browser(self) -> Browser:
        """Get or create browser instance with fallback strategy."""
        if self._browser:
            return self._browser

        # Try Camoufox first
        try:
            self._browser = await self._launch_camoufox()
            return self._browser
        except Exception as e:
            logger.warning(f"Camoufox failed: {e}, trying Playwright Firefox")

        # Fallback to Playwright Firefox
        try:
            async with async_playwright() as p:
                self._browser = await p.firefox.launch(
                    headless=os.getenv("HEADLESS", "true").lower() == "true"
                )
            return self._browser
        except Exception as e:
            logger.warning(f"Firefox failed: {e}, trying Chromium")

        # Last resort: Chromium
        async with async_playwright() as p:
            self._browser = await p.chromium.launch(
                headless=os.getenv("HEADLESS", "true").lower() == "true"
            )
        return self._browser

    async def _launch_camoufox(self) -> Browser:
        """Launch Camoufox with anti-detection settings."""
        from camoufox.async_api import AsyncCamoufox

        return await AsyncCamoufox(
            headless=os.getenv("HEADLESS", "true").lower() == "true",
            config={
                "navigator.userAgent": self.config.user_agent,
                "navigator.hardwareConcurrency": self.config.hardware_concurrency,
                "screen.width": self.config.viewport["width"],
                "screen.height": self.config.viewport["height"],
            }
        ).start()

    async def humanized_delay(self):
        """Add random delay to appear more human-like."""
        delay = random.uniform(*self.config.humanize_delays)
        await asyncio.sleep(delay)

    async def health_check(self) -> bool:
        """Verify browser can make requests."""
        try:
            browser = await self.get_browser()
            context = await browser.new_context()
            page = await context.new_page()
            response = await page.goto("https://httpbin.org/ip")
            await context.close()
            return response.status == 200
        except Exception:
            return False
```

---

## TruckTech+ Client Implementation

### Login Flow

```python
# services/sync/src/trucktechplus/client.py

class TruckTechPlusClient:
    def __init__(self, browser_manager: BrowserManager, credentials: SyncCredential):
        self.browser = browser_manager
        self.credentials = credentials
        self._page: Optional[Page] = None

    async def login(self) -> bool:
        """Complete login flow including MFA."""
        page = await self._get_page()

        # Navigate to login
        await page.goto("https://paccarsolutions.com/login")
        await self.browser.humanized_delay()

        # Fill credentials
        await page.fill('input[name="email"], input[type="email"]', self.credentials.username)
        await self.browser.humanized_delay()
        await page.fill('input[name="password"], input[type="password"]',
                       decrypt_credential(self.credentials.password_enc))
        await self.browser.humanized_delay()

        # Click login
        await page.click('button[type="submit"]')

        # Wait for navigation or MFA prompt
        try:
            await page.wait_for_url("**/dashboard**", timeout=10000)
            logger.info("Login successful - no MFA required")
            return True
        except TimeoutError:
            pass

        # Check for MFA
        if await self._detect_mfa_prompt(page):
            return await self._handle_mfa(page)

        # Check for "already logged in" dialog
        if await self._detect_already_logged_in(page):
            await page.click('button:has-text("Continue")')
            await page.wait_for_url("**/dashboard**")
            return True

        raise LoginError("Unexpected login state")

    async def _handle_mfa(self, page: Page) -> bool:
        """Handle MFA challenge."""
        if self.credentials.totp_secret_enc:
            # Generate and submit TOTP code
            secret = decrypt_credential(self.credentials.totp_secret_enc)
            code = generate_totp(secret)

            await page.fill('input[name="code"], input[placeholder*="code"]', code)
            await self.browser.humanized_delay()
            await page.click('button[type="submit"]')

            # Optionally click "Trust this device"
            trust_button = page.locator('button:has-text("Trust")')
            if await trust_button.is_visible():
                await trust_button.click()

            await page.wait_for_url("**/dashboard**")
            return True
        else:
            # Manual MFA required
            logger.warning("Manual MFA required - run with HEADLESS=false")
            await page.wait_for_url("**/dashboard**", timeout=300000)  # 5 minute timeout
            return True

    async def _detect_mfa_prompt(self, page: Page) -> bool:
        """Check if MFA prompt is displayed."""
        mfa_indicators = [
            'input[name="code"]',
            'text="verification code"',
            'text="two-factor"',
            'text="2FA"',
        ]
        for indicator in mfa_indicators:
            if await page.locator(indicator).is_visible():
                return True
        return False
```

### Data Extraction

```python
# services/sync/src/trucktechplus/extractors.py

class VehicleExtractor:
    """Extract vehicle data from TruckTech+ pages."""

    async def extract_vehicle_list(self, page: Page) -> list[VehicleData]:
        """Extract vehicle list from fleet overview."""
        vehicles = []

        # Navigate to vehicle list
        await page.goto("https://paccarsolutions.com/vehicles")
        await page.wait_for_selector('.vehicle-card, .vehicle-row, table tbody tr')

        # Handle pagination
        while True:
            # Extract from current page
            rows = await page.query_selector_all('.vehicle-row, table tbody tr')
            for row in rows:
                vehicle = await self._parse_vehicle_row(row)
                if vehicle:
                    vehicles.append(vehicle)

            # Check for next page
            next_button = page.locator('button:has-text("Next"), a[aria-label="Next"]')
            if await next_button.is_enabled():
                await next_button.click()
                await page.wait_for_load_state('networkidle')
            else:
                break

        return vehicles

    async def _parse_vehicle_row(self, row) -> Optional[VehicleData]:
        """Parse individual vehicle row."""
        try:
            return VehicleData(
                vin=await row.query_selector('.vin, [data-field="vin"]').inner_text(),
                unit_number=await row.query_selector('.unit, [data-field="unit"]').inner_text(),
                year=int(await row.query_selector('.year, [data-field="year"]').inner_text()),
                make=await row.query_selector('.make, [data-field="make"]').inner_text(),
                model=await row.query_selector('.model, [data-field="model"]').inner_text(),
                odometer=self._parse_odometer(await row.query_selector('.odometer').inner_text()),
            )
        except Exception as e:
            logger.warning(f"Failed to parse vehicle row: {e}")
            return None


class FaultCodeExtractor:
    """Extract fault code data from TruckTech+ pages."""

    async def extract_faults_for_vehicle(self, page: Page, vin: str) -> list[FaultCodeData]:
        """Extract fault codes for a specific vehicle."""
        faults = []

        # Navigate to vehicle detail
        await page.goto(f"https://paccarsolutions.com/vehicles/{vin}/diagnostics")
        await page.wait_for_selector('.fault-list, .dtc-table')

        # Extract active faults
        fault_rows = await page.query_selector_all('.fault-row, .dtc-row')
        for row in fault_rows:
            fault = await self._parse_fault_row(row)
            if fault:
                faults.append(fault)

        return faults

    async def _parse_fault_row(self, row) -> Optional[FaultCodeData]:
        """Parse individual fault code row."""
        try:
            spn_fmi = await row.query_selector('.code, .spn-fmi').inner_text()
            spn, fmi = self._parse_spn_fmi(spn_fmi)

            return FaultCodeData(
                spn=spn,
                fmi=fmi,
                source_address=self._parse_source_address(
                    await row.query_selector('.source, .ecu').inner_text()
                ),
                description=await row.query_selector('.description').inner_text(),
                severity=self._parse_severity(
                    await row.query_selector('.severity, .priority').inner_text()
                ),
                first_seen=self._parse_datetime(
                    await row.query_selector('.first-seen, .timestamp').inner_text()
                ),
                is_active='active' in (await row.get_attribute('class') or ''),
            )
        except Exception as e:
            logger.warning(f"Failed to parse fault row: {e}")
            return None

    def _parse_spn_fmi(self, text: str) -> tuple[int, int]:
        """Parse SPN/FMI from text like 'SPN 3226 / FMI 4'."""
        import re
        match = re.search(r'(\d+)\s*[/\-]\s*(\d+)', text)
        if match:
            return int(match.group(1)), int(match.group(2))
        # Try 'SPN: 3226, FMI: 4' format
        spn_match = re.search(r'SPN[:\s]+(\d+)', text, re.I)
        fmi_match = re.search(r'FMI[:\s]+(\d+)', text, re.I)
        if spn_match and fmi_match:
            return int(spn_match.group(1)), int(fmi_match.group(1))
        raise ValueError(f"Cannot parse SPN/FMI from: {text}")
```

---

## Batch Processing

### State Management

```python
# services/sync/src/batch/manager.py

import json
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

class BatchStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"

@dataclass
class BatchState:
    tenant_id: str
    status: BatchStatus
    started_at: datetime
    completed_at: Optional[datetime]
    vehicles_synced: int
    faults_synced: int
    error_message: Optional[str]
    attempts: int

class BatchManager:
    def __init__(self, state_file: Path = Path("batch_state.json")):
        self.state_file = state_file
        self._state: dict[str, BatchState] = {}
        self._load_state()

    def _load_state(self):
        """Load state from JSON file."""
        if self.state_file.exists():
            with open(self.state_file) as f:
                data = json.load(f)
                for key, value in data.items():
                    self._state[key] = BatchState(**value)

    def _save_state(self):
        """Persist state to JSON file."""
        with open(self.state_file, 'w') as f:
            json.dump({k: asdict(v) for k, v in self._state.items()}, f, default=str)

    def should_sync(self, tenant_id: str) -> bool:
        """Check if tenant needs sync."""
        state = self._state.get(tenant_id)
        if not state:
            return True
        if state.status == BatchStatus.FAILED and state.attempts < 3:
            return True
        if state.status == BatchStatus.COMPLETED:
            # Sync again if last sync was >4 hours ago
            if state.completed_at and datetime.now() - state.completed_at > timedelta(hours=4):
                return True
        return False

    def start_sync(self, tenant_id: str) -> BatchState:
        """Mark sync as started."""
        state = BatchState(
            tenant_id=tenant_id,
            status=BatchStatus.IN_PROGRESS,
            started_at=datetime.now(),
            completed_at=None,
            vehicles_synced=0,
            faults_synced=0,
            error_message=None,
            attempts=self._state.get(tenant_id, BatchState()).attempts + 1,
        )
        self._state[tenant_id] = state
        self._save_state()
        return state

    def complete_sync(self, tenant_id: str, vehicles: int, faults: int):
        """Mark sync as completed."""
        state = self._state[tenant_id]
        state.status = BatchStatus.COMPLETED
        state.completed_at = datetime.now()
        state.vehicles_synced = vehicles
        state.faults_synced = faults
        state.attempts = 0  # Reset attempts on success
        self._save_state()

    def fail_sync(self, tenant_id: str, error: str):
        """Mark sync as failed."""
        state = self._state[tenant_id]
        state.status = BatchStatus.FAILED
        state.completed_at = datetime.now()
        state.error_message = error
        self._save_state()
```

### Scheduler

```python
# services/sync/src/batch/scheduler.py

import click
import asyncio
from datetime import datetime, timedelta

@click.group()
def cli():
    """TruckIQ Data Sync Scheduler"""
    pass

@cli.command()
@click.option('--tenant', '-t', help='Specific tenant ID to sync')
@click.option('--force', '-f', is_flag=True, help='Force sync even if recently completed')
def run_once(tenant: Optional[str], force: bool):
    """Run sync for all or specific tenant."""
    asyncio.run(_run_sync(tenant, force))

async def _run_sync(tenant_id: Optional[str], force: bool):
    """Execute sync workflow."""
    batch_manager = BatchManager()
    db = get_database()

    # Get tenants to sync
    if tenant_id:
        tenants = [await db.get_tenant(tenant_id)]
    else:
        tenants = await db.get_active_tenants_with_credentials()

    for tenant in tenants:
        if not force and not batch_manager.should_sync(tenant.id):
            logger.info(f"Skipping {tenant.name} - recently synced")
            continue

        logger.info(f"Starting sync for {tenant.name}")
        batch_manager.start_sync(tenant.id)

        try:
            # Get credentials
            credentials = await db.get_sync_credentials(tenant.id, "trucktech_plus")

            # Initialize client
            browser = BrowserManager(BrowserConfig())
            client = TruckTechPlusClient(browser, credentials)

            # Login
            if not await client.login():
                raise SyncError("Login failed")

            # Extract data
            extractor = VehicleExtractor()
            vehicles = await extractor.extract_vehicle_list(client.page)

            fault_extractor = FaultCodeExtractor()
            all_faults = []
            for vehicle in vehicles:
                faults = await fault_extractor.extract_faults_for_vehicle(
                    client.page, vehicle.vin
                )
                all_faults.extend(faults)

            # Persist data
            persistence = DataPersistence(db)
            await persistence.upsert_vehicles(tenant.id, vehicles)
            await persistence.upsert_fault_codes(vehicles, all_faults)

            # Mark complete
            batch_manager.complete_sync(tenant.id, len(vehicles), len(all_faults))
            logger.info(f"Completed sync for {tenant.name}: {len(vehicles)} vehicles, {len(all_faults)} faults")

        except Exception as e:
            logger.error(f"Sync failed for {tenant.name}: {e}")
            batch_manager.fail_sync(tenant.id, str(e))
            await send_alert(f"Sync failed for {tenant.name}", str(e))

        finally:
            await browser.close()

@cli.command()
def status():
    """Show sync status for all tenants."""
    batch_manager = BatchManager()
    for tenant_id, state in batch_manager._state.items():
        print(f"{tenant_id}: {state.status.value}")
        print(f"  Last sync: {state.completed_at}")
        print(f"  Vehicles: {state.vehicles_synced}, Faults: {state.faults_synced}")
        if state.error_message:
            print(f"  Error: {state.error_message}")

@cli.command()
@click.option('--hours', default=23, help='Hours threshold for stale detection')
def check_stale(hours: int):
    """Check for stale syncs and send alerts."""
    batch_manager = BatchManager()
    threshold = datetime.now() - timedelta(hours=hours)

    stale_tenants = []
    for tenant_id, state in batch_manager._state.items():
        if state.completed_at and state.completed_at < threshold:
            stale_tenants.append(tenant_id)

    if stale_tenants:
        asyncio.run(send_alert(
            "Stale Sync Alert",
            f"Tenants with stale data (>{hours}h): {', '.join(stale_tenants)}"
        ))

if __name__ == '__main__':
    cli()
```

---

## Data Persistence

```python
# services/sync/src/database/persistence.py

from sqlalchemy.dialects.postgresql import insert

class DataPersistence:
    def __init__(self, db: Database):
        self.db = db

    async def upsert_vehicles(self, tenant_id: str, vehicles: list[VehicleData]):
        """Insert or update vehicles with deduplication."""
        for vehicle in vehicles:
            stmt = insert(Vehicle).values(
                vin=vehicle.vin,
                tenant_id=tenant_id,
                unit_number=vehicle.unit_number,
                year=vehicle.year,
                make=vehicle.make,
                model=vehicle.model,
                engine_make=vehicle.engine_make,
                engine_model=vehicle.engine_model,
                current_odometer=vehicle.odometer,
                engine_hours=vehicle.engine_hours,
                last_sync_at=datetime.now(),
            ).on_conflict_do_update(
                index_elements=['vin', 'tenant_id'],
                set_={
                    'current_odometer': vehicle.odometer,
                    'engine_hours': vehicle.engine_hours,
                    'last_sync_at': datetime.now(),
                    'updated_at': datetime.now(),
                }
            )
            await self.db.execute(stmt)

            # Track odometer history
            await self._record_odometer(vehicle.vin, vehicle.odometer)

    async def upsert_fault_codes(self, vehicles: list[VehicleData], faults: list[FaultCodeData]):
        """Insert or update fault codes."""
        # Group faults by VIN
        faults_by_vin = defaultdict(list)
        for fault in faults:
            faults_by_vin[fault.vin].append(fault)

        for vehicle in vehicles:
            vehicle_id = await self._get_vehicle_id(vehicle.vin)
            vehicle_faults = faults_by_vin.get(vehicle.vin, [])

            # Mark all existing faults as inactive
            await self.db.execute(
                update(FaultCode)
                .where(FaultCode.vehicle_id == vehicle_id)
                .values(status='INACTIVE')
            )

            # Upsert current faults
            for fault in vehicle_faults:
                stmt = insert(FaultCode).values(
                    vehicle_id=vehicle_id,
                    spn=fault.spn,
                    fmi=fault.fmi,
                    source_address=fault.source_address,
                    severity=fault.severity,
                    description=fault.description,
                    status='ACTIVE' if fault.is_active else 'INACTIVE',
                    first_seen_at=fault.first_seen,
                    last_seen_at=datetime.now(),
                ).on_conflict_do_update(
                    index_elements=['vehicle_id', 'spn', 'fmi', 'source_address', 'first_seen_at'],
                    set_={
                        'last_seen_at': datetime.now(),
                        'status': 'ACTIVE' if fault.is_active else 'INACTIVE',
                        'occurrence_count': FaultCode.occurrence_count + 1,
                    }
                )
                await self.db.execute(stmt)

            # Update vehicle fault count
            active_count = len([f for f in vehicle_faults if f.is_active])
            await self.db.execute(
                update(Vehicle)
                .where(Vehicle.id == vehicle_id)
                .values(active_fault_count=active_count)
            )
```

---

## Deployment Configuration

### Render Cron Job

```yaml
# render.yaml
services:
  - type: cron
    name: truckiq-sync
    runtime: python
    buildCommand: pip install -r services/sync/requirements.txt
    schedule: "0 */4 * * *"  # Every 4 hours
    command: python -m src.batch.scheduler run-once
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: truckiq-db
          property: connectionString
      - key: ENCRYPTION_KEY
        sync: false  # Set manually
      - key: HEADLESS
        value: "true"
      - key: SENTRY_DSN
        sync: false
```

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=<32-byte-base64-key>

# Optional
HEADLESS=true
PROXY_URL=http://user:pass@proxy:port
SENTRY_DSN=https://...@sentry.io/...
ALERT_EMAIL=alerts@truckiq.com
RESEND_API_KEY=re_xxx
```

---

## Error Handling & Alerting

```python
# services/sync/src/utils/alerting.py

from resend import Resend

resend = Resend(os.getenv("RESEND_API_KEY"))

async def send_alert(subject: str, message: str, tenant_name: str = None):
    """Send alert via email."""
    try:
        resend.emails.send({
            "from": "TruckIQ Alerts <alerts@truckiq.com>",
            "to": [os.getenv("ALERT_EMAIL", "chris@servicevision.net")],
            "subject": f"[TruckIQ] {subject}",
            "html": f"""
                <h2>{subject}</h2>
                {f'<p><strong>Tenant:</strong> {tenant_name}</p>' if tenant_name else ''}
                <p>{message}</p>
                <p><small>Sent at {datetime.now().isoformat()}</small></p>
            """,
        })
    except Exception as e:
        logger.error(f"Failed to send alert: {e}")

# Screenshot capture for debugging
async def capture_screenshot(page: Page, name: str):
    """Save screenshot for debugging."""
    path = Path(f"screenshots/{name}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.png")
    path.parent.mkdir(exist_ok=True)
    await page.screenshot(path=str(path))
    logger.info(f"Screenshot saved: {path}")
```
