"""Data models for TruckTech+ extracted data."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class VehicleData:
    """Vehicle data extracted from TruckTech+."""

    vin: str
    unit_number: str
    year: Optional[int] = None
    make: str = ""
    model: str = ""
    engine_make: Optional[str] = None
    engine_model: Optional[str] = None
    odometer: Optional[int] = None
    engine_hours: Optional[int] = None
    status: str = "unknown"
    last_location: Optional[dict] = None  # {lat, lng}
    faults: list["FaultCodeData"] = field(default_factory=list)
    extracted_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def from_table_row(cls, row_data: dict) -> "VehicleData":
        """Create VehicleData from scraped table row."""
        year_make_model = row_data.get("year_make_model", "")
        parts = year_make_model.split(" ", 2)

        year = None
        make = ""
        model = ""

        if parts:
            try:
                year = int(parts[0])
                if len(parts) > 1:
                    make = parts[1]
                if len(parts) > 2:
                    model = parts[2]
            except ValueError:
                # Year wasn't a number, treat whole thing as make/model
                make = year_make_model

        return cls(
            vin=row_data.get("vin", ""),
            unit_number=row_data.get("unit_number", ""),
            year=year,
            make=make,
            model=model,
            status=row_data.get("status", "unknown"),
        )


@dataclass
class FaultCodeData:
    """Fault code data extracted from TruckTech+."""

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
    raw_text: str = ""

    @property
    def code_identifier(self) -> str:
        """Get unique identifier for this fault code."""
        return f"SPN{self.spn}-FMI{self.fmi}"

    @property
    def is_critical(self) -> bool:
        """Check if this is a critical fault requiring immediate attention."""
        # Common critical SPNs (derate/shutdown conditions)
        critical_spns = {
            3363,  # Aftertreatment DEF Tank Level Low
            3364,  # DEF Quality
            4364,  # SCR NOx Efficiency
            5246,  # Aftertreatment SCR Operator Inducement
            1569,  # Engine Protection Torque Derate
        }
        return self.spn in critical_spns or self.severity == "critical"


@dataclass
class SyncResult:
    """Result of a sync operation."""

    tenant_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    vehicles_found: int = 0
    faults_found: int = 0
    new_faults: int = 0
    critical_faults: int = 0
    errors: list[str] = field(default_factory=list)
    success: bool = False

    @property
    def duration_seconds(self) -> Optional[float]:
        """Get sync duration in seconds."""
        if self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "tenant_id": self.tenant_id,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_seconds": self.duration_seconds,
            "vehicles_found": self.vehicles_found,
            "faults_found": self.faults_found,
            "new_faults": self.new_faults,
            "critical_faults": self.critical_faults,
            "errors": self.errors,
            "success": self.success,
        }
