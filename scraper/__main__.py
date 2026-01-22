#!/usr/bin/env python3
"""
TruckTech+ Scraper CLI.

Usage:
    # Sync all data (requires credentials in env or file)
    python -m scraper sync

    # Sync with explicit credentials
    python -m scraper sync --username USER --password PASS

    # Test login only
    python -m scraper test-login

    # Run with visible browser for debugging
    HEADLESS=false python -m scraper sync

    # Check status
    python -m scraper status
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

from .client import TruckTechPlusScraper
from .credentials import get_credentials, CredentialStore
from .models import SyncResult


def cmd_sync(args):
    """Run data sync."""
    # Get credentials
    if args.username and args.password:
        username, password, totp_secret = args.username, args.password, None
    else:
        try:
            username, password, totp_secret = get_credentials()
        except ValueError as e:
            print(f"Error: {e}")
            return 1

    print(f"TruckTech+ Sync - {datetime.now().isoformat()}")
    print(f"Username: {username}")
    print(f"Headless: {os.getenv('HEADLESS', 'true')}")
    print("-" * 50)

    with TruckTechPlusScraper(username, password, totp_secret) as scraper:
        if not scraper.login():
            print("Login failed!")
            return 1

        result = scraper.export_all_data(tenant_id=args.tenant or "default")

        # Save result to file
        output_file = Path(args.output or "sync_result.json")
        with open(output_file, "w") as f:
            json.dump(result.to_dict(), f, indent=2, default=str)
        print(f"\nResults saved to: {output_file}")

        return 0 if result.success else 1


def cmd_test_login(args):
    """Test login credentials."""
    if args.username and args.password:
        username, password, totp_secret = args.username, args.password, None
    else:
        try:
            username, password, totp_secret = get_credentials()
        except ValueError as e:
            print(f"Error: {e}")
            return 1

    print(f"Testing login for: {username}")

    with TruckTechPlusScraper(username, password, totp_secret) as scraper:
        if scraper.login():
            print("Login successful!")
            return 0
        else:
            print("Login failed!")
            return 1


def cmd_status(args):
    """Check sync status."""
    session_file = Path("session_storage.json")

    print("TruckTech+ Scraper Status")
    print("-" * 50)

    # Check session
    if session_file.exists():
        stat = session_file.stat()
        print(f"Session file: {session_file}")
        print(f"  Modified: {datetime.fromtimestamp(stat.st_mtime).isoformat()}")
        print(f"  Size: {stat.st_size} bytes")
    else:
        print("Session file: Not found (will require fresh login)")

    # Check last sync result
    result_file = Path("sync_result.json")
    if result_file.exists():
        with open(result_file) as f:
            result = json.load(f)
        print(f"\nLast sync result: {result_file}")
        print(f"  Started: {result.get('started_at')}")
        print(f"  Duration: {result.get('duration_seconds', 0):.1f}s")
        print(f"  Vehicles: {result.get('vehicles_found', 0)}")
        print(f"  Faults: {result.get('faults_found', 0)}")
        print(f"  Success: {result.get('success', False)}")
    else:
        print("\nLast sync: No results found")

    # Check credentials
    print("\nCredentials:")
    if os.getenv("TRUCKTECH_USERNAME"):
        print("  Source: Environment variables")
    elif Path(".trucktech_credentials.json").exists():
        print("  Source: Credentials file")
    else:
        print("  Source: Not configured")

    return 0


def cmd_generate_key(args):
    """Generate encryption key."""
    key = CredentialStore.generate_key()
    print("Generated encryption key (add to ENCRYPTION_KEY env var):")
    print(key)
    return 0


def main():
    parser = argparse.ArgumentParser(
        description="TruckTech+ Scraper - Extract data from PACCAR Solutions portal",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # sync command
    sync_parser = subparsers.add_parser("sync", help="Sync vehicle and fault data")
    sync_parser.add_argument("--username", "-u", help="Portal username")
    sync_parser.add_argument("--password", "-p", help="Portal password")
    sync_parser.add_argument("--tenant", "-t", help="Tenant identifier")
    sync_parser.add_argument("--output", "-o", help="Output file path")
    sync_parser.set_defaults(func=cmd_sync)

    # test-login command
    login_parser = subparsers.add_parser("test-login", help="Test login credentials")
    login_parser.add_argument("--username", "-u", help="Portal username")
    login_parser.add_argument("--password", "-p", help="Portal password")
    login_parser.set_defaults(func=cmd_test_login)

    # status command
    status_parser = subparsers.add_parser("status", help="Check sync status")
    status_parser.set_defaults(func=cmd_status)

    # generate-key command
    key_parser = subparsers.add_parser("generate-key", help="Generate encryption key")
    key_parser.set_defaults(func=cmd_generate_key)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
