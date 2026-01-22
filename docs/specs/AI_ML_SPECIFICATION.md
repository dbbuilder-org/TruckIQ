# TruckIQ AI - Machine Learning Specification

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Overview

This document specifies the AI/ML components of TruckIQ AI, focusing on predictive maintenance models that forecast component failures before they occur.

---

## ML Objectives

### Primary Goals

1. **Failure Prediction**: Predict probability of component failure within 30/60/90 days
2. **Risk Scoring**: Generate composite vehicle health scores (0-100)
3. **Anomaly Detection**: Identify unusual patterns in telemetry data
4. **Root Cause Analysis**: Explain which factors contribute to risk

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Precision** (Critical alerts) | >80% | True positives / All positive predictions |
| **Recall** (Critical failures) | >70% | Detected failures / All actual failures |
| **Lead Time** | >7 days | Average days warning before failure |
| **False Positive Rate** | <20% | False alarms / Total alerts |

---

## Data Sources

### Input Features

| Feature Category | Examples | Source |
|-----------------|----------|--------|
| **Fault Codes** | SPN, FMI, severity, frequency, recurrence | TruckTech+ |
| **Vehicle Profile** | Year, make, model, engine, age | TruckTech+ |
| **Usage Metrics** | Odometer, engine hours, daily miles | TruckTech+ |
| **Fault History** | Historical fault patterns, repair records | TruckTech+ / Service records |
| **Fleet Context** | Similar vehicles' failure patterns | Cross-fleet analysis |
| **Environmental** | Operating region, seasonal patterns | Inferred from location |

### Feature Engineering

```python
# services/predictor/src/features/extractor.py

from dataclasses import dataclass
from typing import List
import numpy as np
from datetime import datetime, timedelta

@dataclass
class VehicleFeatures:
    """Engineered features for ML models."""

    # Vehicle profile
    vehicle_age_days: int
    total_mileage: int
    engine_hours: int
    miles_per_day_avg: float
    hours_per_day_avg: float

    # Fault patterns
    active_fault_count: int
    active_critical_faults: int
    active_major_faults: int
    fault_count_30d: int
    fault_count_90d: int
    unique_spns_30d: int
    recurring_fault_rate: float  # Faults that reappeared after clearing

    # Component-specific fault counts
    engine_faults_30d: int
    aftertreatment_faults_30d: int
    electrical_faults_30d: int
    brake_faults_30d: int
    transmission_faults_30d: int

    # Time-based patterns
    days_since_last_fault: int
    days_since_last_critical: int
    fault_trend_30d: float  # Slope of fault count over time

    # Fleet context
    fleet_avg_faults_30d: float
    fleet_failure_rate_90d: float
    similar_vehicle_failure_rate: float  # Same year/make/model

class FeatureExtractor:
    """Extract ML features from raw vehicle data."""

    def __init__(self, db_session):
        self.db = db_session

    async def extract_features(self, vehicle_id: str) -> VehicleFeatures:
        """Generate feature vector for a single vehicle."""
        vehicle = await self._get_vehicle(vehicle_id)
        faults = await self._get_fault_history(vehicle_id)
        fleet_stats = await self._get_fleet_stats(vehicle.tenant_id)

        now = datetime.now()

        # Calculate time-based features
        faults_30d = [f for f in faults if (now - f.last_seen_at).days <= 30]
        faults_90d = [f for f in faults if (now - f.last_seen_at).days <= 90]

        return VehicleFeatures(
            # Vehicle profile
            vehicle_age_days=(now.date() - vehicle.in_service_date).days if vehicle.in_service_date else 365,
            total_mileage=vehicle.current_odometer,
            engine_hours=vehicle.engine_hours or 0,
            miles_per_day_avg=self._calculate_daily_avg(vehicle.current_odometer, vehicle.in_service_date),
            hours_per_day_avg=self._calculate_daily_avg(vehicle.engine_hours, vehicle.in_service_date),

            # Fault patterns
            active_fault_count=vehicle.active_fault_count,
            active_critical_faults=len([f for f in faults if f.status == 'ACTIVE' and f.severity == 'CRITICAL']),
            active_major_faults=len([f for f in faults if f.status == 'ACTIVE' and f.severity == 'MAJOR']),
            fault_count_30d=len(faults_30d),
            fault_count_90d=len(faults_90d),
            unique_spns_30d=len(set(f.spn for f in faults_30d)),
            recurring_fault_rate=self._calc_recurring_rate(faults),

            # Component-specific
            engine_faults_30d=len([f for f in faults_30d if self._is_engine_fault(f)]),
            aftertreatment_faults_30d=len([f for f in faults_30d if self._is_aftertreatment_fault(f)]),
            electrical_faults_30d=len([f for f in faults_30d if self._is_electrical_fault(f)]),
            brake_faults_30d=len([f for f in faults_30d if self._is_brake_fault(f)]),
            transmission_faults_30d=len([f for f in faults_30d if self._is_transmission_fault(f)]),

            # Time-based
            days_since_last_fault=self._days_since_last_fault(faults),
            days_since_last_critical=self._days_since_severity(faults, 'CRITICAL'),
            fault_trend_30d=self._calculate_trend(faults_30d),

            # Fleet context
            fleet_avg_faults_30d=fleet_stats['avg_faults_30d'],
            fleet_failure_rate_90d=fleet_stats['failure_rate_90d'],
            similar_vehicle_failure_rate=await self._get_similar_vehicle_rate(vehicle),
        )

    def _is_engine_fault(self, fault) -> bool:
        """Check if fault is engine-related based on SPN ranges."""
        engine_spns = range(0, 200)  # Simplified - actual ranges are complex
        return fault.spn in engine_spns or fault.source_address == 0

    def _is_aftertreatment_fault(self, fault) -> bool:
        """Check if fault is aftertreatment-related."""
        aftertreatment_spns = range(3200, 3400)  # DEF, DPF, SCR related
        return fault.spn in aftertreatment_spns

    def _calculate_trend(self, faults: List) -> float:
        """Calculate slope of fault occurrence over time."""
        if len(faults) < 2:
            return 0.0

        # Group by week and fit linear regression
        weeks = {}
        now = datetime.now()
        for f in faults:
            week = (now - f.last_seen_at).days // 7
            weeks[week] = weeks.get(week, 0) + 1

        if len(weeks) < 2:
            return 0.0

        x = np.array(list(weeks.keys()))
        y = np.array(list(weeks.values()))
        slope = np.polyfit(x, y, 1)[0]
        return float(slope)
```

---

## Prediction Models

### Model 1: Component Failure Prediction (Survival Analysis)

Uses survival analysis to predict time-to-failure for major components.

```python
# services/predictor/src/models/survival.py

from lifelines import WeibullAFTFitter
import pandas as pd
import numpy as np

class ComponentSurvivalModel:
    """Survival analysis model for component failure prediction."""

    COMPONENTS = [
        'engine',
        'aftertreatment',
        'def_system',
        'turbocharger',
        'fuel_system',
        'electrical',
        'brakes',
        'transmission',
    ]

    def __init__(self):
        self.models = {}  # Component -> fitted model
        self.feature_columns = []

    def train(self, training_data: pd.DataFrame):
        """
        Train survival models for each component.

        training_data columns:
        - vehicle_id
        - component
        - duration (days until failure or censoring)
        - event (1 = failure, 0 = censored/no failure)
        - feature columns...
        """
        self.feature_columns = [c for c in training_data.columns
                               if c not in ['vehicle_id', 'component', 'duration', 'event']]

        for component in self.COMPONENTS:
            component_data = training_data[training_data['component'] == component]

            if len(component_data) < 100:
                logger.warning(f"Insufficient data for {component}, skipping")
                continue

            model = WeibullAFTFitter()
            model.fit(
                component_data[['duration', 'event'] + self.feature_columns],
                duration_col='duration',
                event_col='event',
            )

            self.models[component] = model
            logger.info(f"Trained {component} model, concordance: {model.concordance_index_:.3f}")

    def predict_failure_probability(
        self,
        features: VehicleFeatures,
        component: str,
        days: int = 30
    ) -> dict:
        """
        Predict failure probability within specified days.

        Returns:
            {
                'probability': 0.0-1.0,
                'confidence': 0.0-1.0,
                'contributing_factors': [...]
            }
        """
        if component not in self.models:
            return {'probability': 0.0, 'confidence': 0.0, 'contributing_factors': []}

        model = self.models[component]

        # Convert features to dataframe row
        feature_dict = {col: getattr(features, col, 0) for col in self.feature_columns}
        X = pd.DataFrame([feature_dict])

        # Get survival probability at time t
        survival_prob = model.predict_survival_function(X, times=[days]).iloc[0, 0]
        failure_prob = 1 - survival_prob

        # Calculate confidence based on model quality and data availability
        confidence = self._calculate_confidence(model, features)

        # Get contributing factors
        factors = self._get_contributing_factors(model, feature_dict)

        return {
            'probability': float(failure_prob),
            'confidence': float(confidence),
            'contributing_factors': factors,
        }

    def _calculate_confidence(self, model, features: VehicleFeatures) -> float:
        """Calculate prediction confidence score."""
        base_confidence = model.concordance_index_  # Model quality

        # Reduce confidence if missing key data
        data_completeness = 1.0
        if features.engine_hours == 0:
            data_completeness -= 0.1
        if features.fault_count_90d == 0 and features.vehicle_age_days > 30:
            data_completeness -= 0.1

        return min(base_confidence * data_completeness, 1.0)

    def _get_contributing_factors(self, model, features: dict) -> list:
        """Extract top factors contributing to prediction."""
        # Get feature importances from model coefficients
        coefficients = model.params_

        # Calculate contribution = coefficient * feature_value
        contributions = []
        for col in self.feature_columns:
            if col in coefficients.index:
                coef = coefficients[col]
                value = features.get(col, 0)
                contribution = coef * value
                contributions.append({
                    'feature': col,
                    'value': value,
                    'coefficient': coef,
                    'contribution': contribution,
                })

        # Sort by absolute contribution
        contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)

        # Return top 5 factors
        return contributions[:5]
```

### Model 2: Anomaly Detection

Identifies unusual patterns compared to fleet baseline.

```python
# services/predictor/src/models/anomaly.py

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np

class AnomalyDetector:
    """Detect anomalous vehicle behavior compared to fleet baseline."""

    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
        )
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit(self, fleet_features: np.ndarray):
        """Fit model on fleet baseline data."""
        scaled = self.scaler.fit_transform(fleet_features)
        self.model.fit(scaled)
        self.is_fitted = True

    def detect(self, vehicle_features: np.ndarray) -> dict:
        """
        Detect if vehicle is anomalous.

        Returns:
            {
                'is_anomaly': bool,
                'anomaly_score': -1 to 1 (lower = more anomalous),
                'deviations': [...] # Features that deviate most
            }
        """
        if not self.is_fitted:
            raise RuntimeError("Model not fitted")

        scaled = self.scaler.transform(vehicle_features.reshape(1, -1))

        # Get prediction (-1 = anomaly, 1 = normal)
        prediction = self.model.predict(scaled)[0]

        # Get anomaly score (lower = more anomalous)
        score = self.model.score_samples(scaled)[0]

        # Find which features deviate most from mean
        deviations = self._find_deviations(vehicle_features)

        return {
            'is_anomaly': prediction == -1,
            'anomaly_score': float(score),
            'deviations': deviations,
        }

    def _find_deviations(self, features: np.ndarray) -> list:
        """Find features that deviate most from fleet average."""
        # Z-scores based on fitted scaler
        z_scores = (features - self.scaler.mean_) / self.scaler.scale_

        # Return features with |z| > 2
        deviations = []
        for i, z in enumerate(z_scores):
            if abs(z) > 2:
                deviations.append({
                    'feature_index': i,
                    'z_score': float(z),
                    'direction': 'high' if z > 0 else 'low',
                })

        return sorted(deviations, key=lambda x: abs(x['z_score']), reverse=True)
```

### Model 3: Risk Scorer

Combines predictions into a single health score.

```python
# services/predictor/src/models/risk_scorer.py

from dataclasses import dataclass
from typing import List
from enum import Enum

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class RiskAssessment:
    """Complete risk assessment for a vehicle."""
    health_score: int  # 0-100, higher = healthier
    risk_level: RiskLevel
    top_risks: List[dict]
    recommended_actions: List[str]
    prediction_confidence: float

class RiskScorer:
    """Combine component predictions into overall risk score."""

    # Component weights for risk calculation
    COMPONENT_WEIGHTS = {
        'engine': 1.0,
        'aftertreatment': 0.9,
        'def_system': 0.8,
        'turbocharger': 0.7,
        'fuel_system': 0.8,
        'electrical': 0.6,
        'brakes': 0.9,
        'transmission': 0.8,
    }

    # Severity weights
    SEVERITY_WEIGHTS = {
        'CRITICAL': 1.0,
        'MAJOR': 0.6,
        'MINOR': 0.2,
        'INFO': 0.05,
    }

    def __init__(self, survival_model: ComponentSurvivalModel, anomaly_detector: AnomalyDetector):
        self.survival = survival_model
        self.anomaly = anomaly_detector

    def calculate_risk(self, features: VehicleFeatures) -> RiskAssessment:
        """Calculate comprehensive risk assessment."""

        # Get component failure probabilities
        component_risks = {}
        for component, weight in self.COMPONENT_WEIGHTS.items():
            pred = self.survival.predict_failure_probability(features, component, days=30)
            component_risks[component] = {
                'probability_30d': pred['probability'],
                'probability_60d': self.survival.predict_failure_probability(features, component, days=60)['probability'],
                'probability_90d': self.survival.predict_failure_probability(features, component, days=90)['probability'],
                'weight': weight,
                'weighted_risk': pred['probability'] * weight,
                'factors': pred['contributing_factors'],
            }

        # Get anomaly assessment
        feature_array = self._features_to_array(features)
        anomaly = self.anomaly.detect(feature_array)

        # Calculate active fault penalty
        fault_penalty = self._calculate_fault_penalty(features)

        # Calculate composite risk score
        weighted_risk_sum = sum(r['weighted_risk'] for r in component_risks.values())
        weight_sum = sum(self.COMPONENT_WEIGHTS.values())
        avg_weighted_risk = weighted_risk_sum / weight_sum

        # Combine factors into health score
        # Start at 100, subtract based on risk
        health_score = 100
        health_score -= avg_weighted_risk * 40  # Up to 40 points for failure probability
        health_score -= fault_penalty * 30  # Up to 30 points for active faults
        health_score -= (1 - anomaly['anomaly_score'] + 1) / 2 * 15  # Up to 15 for anomalies
        health_score -= (1 - features.recurring_fault_rate) * 15  # Up to 15 for recurring issues

        health_score = max(0, min(100, int(health_score)))

        # Determine risk level
        if health_score >= 80:
            risk_level = RiskLevel.LOW
        elif health_score >= 60:
            risk_level = RiskLevel.MEDIUM
        elif health_score >= 40:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.CRITICAL

        # Get top risks
        top_risks = sorted(
            [{'component': k, **v} for k, v in component_risks.items()],
            key=lambda x: x['weighted_risk'],
            reverse=True
        )[:5]

        # Generate recommendations
        actions = self._generate_recommendations(features, top_risks, anomaly)

        # Calculate overall confidence
        confidences = [self.survival.predict_failure_probability(features, c, 30)['confidence']
                      for c in self.COMPONENT_WEIGHTS.keys()
                      if c in self.survival.models]
        avg_confidence = np.mean(confidences) if confidences else 0.5

        return RiskAssessment(
            health_score=health_score,
            risk_level=risk_level,
            top_risks=top_risks,
            recommended_actions=actions,
            prediction_confidence=avg_confidence,
        )

    def _calculate_fault_penalty(self, features: VehicleFeatures) -> float:
        """Calculate penalty based on active faults."""
        penalty = 0.0
        penalty += features.active_critical_faults * self.SEVERITY_WEIGHTS['CRITICAL'] * 0.3
        penalty += features.active_major_faults * self.SEVERITY_WEIGHTS['MAJOR'] * 0.2
        penalty += min(features.active_fault_count - features.active_critical_faults - features.active_major_faults, 5) * 0.05
        return min(penalty, 1.0)

    def _generate_recommendations(
        self,
        features: VehicleFeatures,
        top_risks: List[dict],
        anomaly: dict
    ) -> List[str]:
        """Generate actionable recommendations."""
        actions = []

        # Critical fault actions
        if features.active_critical_faults > 0:
            actions.append("IMMEDIATE: Address active critical fault codes before operating")

        # High probability failures
        for risk in top_risks:
            if risk['probability_30d'] > 0.7:
                actions.append(f"URGENT: Schedule {risk['component']} inspection - {int(risk['probability_30d']*100)}% failure probability within 30 days")
            elif risk['probability_30d'] > 0.5:
                actions.append(f"SOON: Plan {risk['component']} service - elevated failure risk detected")

        # Anomaly-based actions
        if anomaly['is_anomaly']:
            actions.append("INVESTIGATE: Vehicle showing unusual patterns compared to fleet baseline")

        # Preventive actions
        if features.fault_trend_30d > 0.5:
            actions.append("MONITOR: Increasing fault trend detected - review maintenance schedule")

        if features.recurring_fault_rate > 0.3:
            actions.append("ROOT CAUSE: High recurring fault rate - investigate underlying issues")

        return actions[:5]  # Limit to top 5 recommendations
```

---

## Model Training Pipeline

### Training Data Preparation

```python
# services/predictor/src/training/pipeline.py

class TrainingPipeline:
    """Prepare training data and train models."""

    def __init__(self, db_session):
        self.db = db_session

    async def prepare_survival_training_data(self) -> pd.DataFrame:
        """
        Prepare training data for survival models.

        For each (vehicle, component) pair:
        - If component failed: duration = days from feature snapshot to failure, event = 1
        - If no failure: duration = days from snapshot to now (or end of observation), event = 0
        """
        records = []

        # Get all vehicles with sufficient history
        vehicles = await self.db.execute(
            select(Vehicle)
            .where(Vehicle.in_service_date < datetime.now() - timedelta(days=90))
        )

        for vehicle in vehicles:
            # Get feature snapshots at various points in time
            for snapshot_days_ago in [90, 180, 270, 365]:
                snapshot_date = datetime.now() - timedelta(days=snapshot_days_ago)

                # Get features as of snapshot date
                features = await self._get_historical_features(vehicle.id, snapshot_date)
                if not features:
                    continue

                # For each component, determine if failure occurred
                for component in ComponentSurvivalModel.COMPONENTS:
                    failure_date = await self._get_component_failure_date(
                        vehicle.id, component, after=snapshot_date
                    )

                    if failure_date:
                        duration = (failure_date - snapshot_date).days
                        event = 1
                    else:
                        duration = snapshot_days_ago
                        event = 0

                    record = {
                        'vehicle_id': vehicle.id,
                        'component': component,
                        'duration': duration,
                        'event': event,
                        **asdict(features),
                    }
                    records.append(record)

        return pd.DataFrame(records)

    async def _get_component_failure_date(
        self,
        vehicle_id: str,
        component: str,
        after: datetime
    ) -> Optional[datetime]:
        """
        Determine if component had a failure event.

        A "failure" is defined as:
        - Critical fault code in component category, OR
        - Service record indicating component replacement/major repair
        """
        # Check for critical faults
        critical_fault = await self.db.execute(
            select(FaultCode)
            .where(
                FaultCode.vehicle_id == vehicle_id,
                FaultCode.severity == 'CRITICAL',
                FaultCode.first_seen_at > after,
                # Component-specific SPN ranges would be checked here
            )
            .order_by(FaultCode.first_seen_at)
            .limit(1)
        )

        if critical_fault:
            return critical_fault.first_seen_at

        # Future: Check service records when integrated
        return None

    def train_models(self, training_data: pd.DataFrame):
        """Train all models and save artifacts."""

        # Train survival models
        survival_model = ComponentSurvivalModel()
        survival_model.train(training_data)

        # Train anomaly detector on recent feature vectors
        recent_features = training_data[
            training_data['snapshot_date'] > datetime.now() - timedelta(days=30)
        ][self.feature_columns].values

        anomaly_model = AnomalyDetector()
        anomaly_model.fit(recent_features)

        # Save models
        self._save_model(survival_model, 'survival_model.pkl')
        self._save_model(anomaly_model, 'anomaly_model.pkl')

        logger.info("Model training complete")

    def _save_model(self, model, filename: str):
        """Save model to disk."""
        import pickle
        path = Path(f"models/{filename}")
        path.parent.mkdir(exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(model, f)
```

---

## Inference API

```python
# services/predictor/src/api/server.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="TruckIQ Prediction Service")

# Load models on startup
survival_model = None
anomaly_model = None
risk_scorer = None

@app.on_event("startup")
async def load_models():
    global survival_model, anomaly_model, risk_scorer
    survival_model = load_model("survival_model.pkl")
    anomaly_model = load_model("anomaly_model.pkl")
    risk_scorer = RiskScorer(survival_model, anomaly_model)

class PredictionRequest(BaseModel):
    vehicle_id: str

class PredictionResponse(BaseModel):
    vehicle_id: str
    health_score: int
    risk_level: str
    predictions: List[dict]
    recommended_actions: List[str]
    confidence: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Generate predictions for a vehicle."""
    try:
        # Extract features
        extractor = FeatureExtractor(db_session)
        features = await extractor.extract_features(request.vehicle_id)

        # Calculate risk
        assessment = risk_scorer.calculate_risk(features)

        # Format predictions
        predictions = []
        for component in ComponentSurvivalModel.COMPONENTS:
            pred = survival_model.predict_failure_probability(features, component, days=30)
            if pred['probability'] > 0.1:  # Only include non-trivial predictions
                predictions.append({
                    'component': component,
                    'probability_30d': pred['probability'],
                    'probability_60d': survival_model.predict_failure_probability(features, component, 60)['probability'],
                    'probability_90d': survival_model.predict_failure_probability(features, component, 90)['probability'],
                    'confidence': pred['confidence'],
                    'contributing_factors': pred['contributing_factors'],
                })

        return PredictionResponse(
            vehicle_id=request.vehicle_id,
            health_score=assessment.health_score,
            risk_level=assessment.risk_level.value,
            predictions=predictions,
            recommended_actions=assessment.recommended_actions,
            confidence=assessment.prediction_confidence,
        )

    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-predict")
async def batch_predict(vehicle_ids: List[str]):
    """Generate predictions for multiple vehicles."""
    results = []
    for vid in vehicle_ids:
        try:
            result = await predict(PredictionRequest(vehicle_id=vid))
            results.append(result)
        except Exception as e:
            results.append({"vehicle_id": vid, "error": str(e)})
    return results

@app.get("/health")
async def health_check():
    """Service health check."""
    return {
        "status": "healthy",
        "models_loaded": survival_model is not None,
        "version": "1.0.0",
    }
```

---

## Model Monitoring

### Performance Tracking

```python
# services/predictor/src/monitoring.py

class ModelMonitor:
    """Track model performance over time."""

    async def log_prediction(self, vehicle_id: str, prediction: dict):
        """Log prediction for future validation."""
        await self.db.execute(
            insert(PredictionLog).values(
                vehicle_id=vehicle_id,
                predicted_at=datetime.now(),
                health_score=prediction['health_score'],
                risk_level=prediction['risk_level'],
                top_component=prediction['predictions'][0]['component'] if prediction['predictions'] else None,
                top_probability=prediction['predictions'][0]['probability_30d'] if prediction['predictions'] else 0,
            )
        )

    async def validate_predictions(self, lookback_days: int = 30):
        """
        Compare predictions against actual outcomes.

        For predictions made 30+ days ago:
        - Did predicted failures occur?
        - Did unexpected failures occur?
        """
        cutoff = datetime.now() - timedelta(days=lookback_days)

        predictions = await self.db.execute(
            select(PredictionLog)
            .where(PredictionLog.predicted_at < cutoff)
            .where(PredictionLog.validated == False)
        )

        results = {
            'true_positives': 0,
            'false_positives': 0,
            'false_negatives': 0,
            'true_negatives': 0,
        }

        for pred in predictions:
            # Check if failure occurred
            failure = await self._check_failure_occurred(
                pred.vehicle_id,
                pred.top_component,
                pred.predicted_at,
                pred.predicted_at + timedelta(days=30)
            )

            predicted_failure = pred.top_probability > 0.5

            if predicted_failure and failure:
                results['true_positives'] += 1
            elif predicted_failure and not failure:
                results['false_positives'] += 1
            elif not predicted_failure and failure:
                results['false_negatives'] += 1
            else:
                results['true_negatives'] += 1

            # Mark as validated
            pred.validated = True
            pred.actual_outcome = failure

        await self.db.commit()

        # Calculate metrics
        precision = results['true_positives'] / (results['true_positives'] + results['false_positives']) if results['true_positives'] + results['false_positives'] > 0 else 0
        recall = results['true_positives'] / (results['true_positives'] + results['false_negatives']) if results['true_positives'] + results['false_negatives'] > 0 else 0

        logger.info(f"Model validation: precision={precision:.2f}, recall={recall:.2f}")

        return {
            **results,
            'precision': precision,
            'recall': recall,
        }
```

---

## MVP Simplifications

For MVP, we'll start with simpler heuristic-based scoring while collecting data for ML training:

```python
# services/predictor/src/models/mvp_scorer.py

class MVPRiskScorer:
    """Simple rule-based scorer for MVP."""

    def calculate_risk(self, features: VehicleFeatures) -> RiskAssessment:
        """Rule-based risk calculation."""

        # Start with perfect score
        score = 100
        actions = []

        # Deduct for active faults
        score -= features.active_critical_faults * 25
        score -= features.active_major_faults * 10
        score -= min(features.active_fault_count, 10) * 2

        # Deduct for fault trends
        if features.fault_count_30d > features.fault_count_90d / 3:
            score -= 10
            actions.append("Increasing fault trend detected")

        # Deduct for recurring faults
        if features.recurring_fault_rate > 0.3:
            score -= 15
            actions.append("High recurring fault rate - investigate root cause")

        # Age/mileage factors
        if features.total_mileage > 500000:
            score -= 5
        if features.vehicle_age_days > 5 * 365:
            score -= 5

        # Aftertreatment issues (common problem area)
        if features.aftertreatment_faults_30d > 2:
            score -= 10
            actions.append("Multiple aftertreatment faults - schedule DEF system inspection")

        score = max(0, min(100, score))

        if score >= 80:
            risk_level = RiskLevel.LOW
        elif score >= 60:
            risk_level = RiskLevel.MEDIUM
        elif score >= 40:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.CRITICAL

        if features.active_critical_faults > 0:
            actions.insert(0, "IMMEDIATE: Address critical fault codes")

        return RiskAssessment(
            health_score=score,
            risk_level=risk_level,
            top_risks=[],  # Simplified for MVP
            recommended_actions=actions,
            prediction_confidence=0.6,  # Lower confidence for heuristics
        )
```
