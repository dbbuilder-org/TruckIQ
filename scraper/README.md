# TruckTech+ Scraper

Automated data extraction from the PACCAR Solutions portal (TruckTech+) for the TruckIQ AI fleet intelligence platform.

## Architecture

- **Portal URL**: https://paccar.decisiv.net
- **Platform**: Decisiv SRM v8.29.0
- **Authentication**: Username/Password (no MFA currently enforced - January 2026)

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

## Configuration

### Option 1: Environment Variables (Recommended)

```bash
export TRUCKTECH_USERNAME="your_username"
export TRUCKTECH_PASSWORD="your_password"
export TRUCKTECH_TOTP_SECRET="BASE32SECRET"  # Optional, for MFA
export HEADLESS="true"  # Set to "false" for debugging
```

### Option 2: Credentials File

Create `.trucktech_credentials.json`:

```json
{
  "username": "your_username",
  "password": "your_password",
  "totp_secret": "BASE32SECRET"
}
```

**Important**: This file will be chmod'd to 600 (owner read/write only).

## Usage

```bash
# Check status
python -m scraper status

# Test login
python -m scraper test-login

# Run full sync
python -m scraper sync

# Sync with explicit credentials
python -m scraper sync -u USERNAME -p PASSWORD

# Sync with visible browser (for debugging)
HEADLESS=false python -m scraper sync

# Sync for specific tenant
python -m scraper sync --tenant acme-trucking --output acme_sync.json
```

## Output

Sync results are saved to `sync_result.json`:

```json
{
  "tenant_id": "default",
  "started_at": "2026-01-21T10:30:00",
  "completed_at": "2026-01-21T10:31:45",
  "duration_seconds": 105.2,
  "vehicles_found": 142,
  "faults_found": 23,
  "critical_faults": 3,
  "new_faults": 5,
  "errors": [],
  "success": true
}
```

## Session Management

The scraper automatically saves and reuses session cookies to minimize login frequency. Sessions are stored in `session_storage.json` and typically last ~24 hours.

## MFA Support (Future-Proofing)

If PACCAR enables MFA in the future:

### TOTP (Authenticator App)

1. During MFA setup, click "Can't scan QR code?" to reveal the manual entry key
2. Set `TRUCKTECH_TOTP_SECRET` to this base32 key
3. The scraper will automatically generate codes

### Manual MFA

Run with visible browser and complete MFA manually:

```bash
HEADLESS=false python -m scraper sync
```

The session will be saved for future runs.

## Data Models

### VehicleData

```python
@dataclass
class VehicleData:
    vin: str
    unit_number: str
    year: int
    make: str
    model: str
    status: str
    faults: list[FaultCodeData]
```

### FaultCodeData

```python
@dataclass
class FaultCodeData:
    vin: str
    spn: int  # Suspect Parameter Number
    fmi: int  # Failure Mode Identifier
    is_active: bool
    severity: str  # critical, major, minor, info
    description: str
```

## Error Handling

- **LoginError**: Invalid credentials or unexpected login response
- **MFARequired**: MFA is enforced but not configured
- **SessionExpired**: Session has expired, re-login needed
- **RateLimited**: Too many requests, automatic retry with backoff

## Development

```bash
# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=scraper
```

## Production Deployment

See `docs/specs/DATA_INTEGRATION.md` for Render.com cron job configuration.

## Security

- Never commit credentials or session files
- Use environment variables in production
- Encrypt stored credentials with ENCRYPTION_KEY
- Session files contain auth tokens - protect accordingly
