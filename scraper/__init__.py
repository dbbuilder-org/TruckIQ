"""
TruckTech+ Scraper - Data extraction from PACCAR Solutions portal.

This module provides automated data extraction from the TruckTech+ system
(powered by Decisiv SRM) for the TruckIQ AI fleet intelligence platform.
"""

__version__ = "0.1.0"
__author__ = "Chris Therriault <chris@servicevision.net>"

from .client import TruckTechPlusScraper
from .models import VehicleData, FaultCodeData
from .errors import (
    SyncError,
    LoginError,
    MFARequired,
    SessionExpired,
    RateLimited,
)

__all__ = [
    "TruckTechPlusScraper",
    "VehicleData",
    "FaultCodeData",
    "SyncError",
    "LoginError",
    "MFARequired",
    "SessionExpired",
    "RateLimited",
]
