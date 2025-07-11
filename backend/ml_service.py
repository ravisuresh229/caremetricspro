import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.feature_selection import SelectKBest, f_regression
import joblib
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json
import os

logger = logging.getLogger(__name__)

class HealthcareMLService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_selectors = {}
        self.feature_importance = {}
        self.model_performance = {}
        self.feature_names = [
            'beds', 'rating', 'patient_volume', 'response_rate', 
            'teaching_status', 'urban_rural', 'region_encoded',
            'beds_per_volume', 'volume_per_bed', 'rating_squared'
        ]
        
    def prepare_features(self, data: Dict) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """Prepare features for machine learning models"""
        features = []
        targets = {}
        
        for hospital_data in data['hcahps_data']:
            hospital_info = next(h for h in data['hospitals'] if h['id'] == hospital_data['hospital_id'])
            
            # Create comprehensive feature vector
            feature_vector = self._create_feature_vector(hospital_info, hospital_data)
            features.append(feature_vector)
            
            # Store targets for each metric
            target_metrics = [
                'communication_nurses', 'communication_doctors', 'responsiveness_staff',
                'pain_management', 'medication_communication', 'cleanliness', 'quietness',
                'discharge_information', 'overall_rating', 'recommend_hospital'
            ]
            
            for metric in target_metrics:
                if metric not in targets:
                    targets[metric] = []
                targets[metric].append(hospital_data[metric])
        
        return np.array(features), targets
    
    def _create_feature_vector(self, hospital_info: Dict, hospital_data: Dict) -> List[float]:
        """Create a comprehensive feature vector for a hospital"""
        # Basic features
        beds = hospital_info['beds']
        rating = hospital_info['rating']
        patient_volume = hospital_data['patient_volume']
        response_rate = hospital_data['response_rate']
        
        # Categorical features
        teaching_status = 1 if hospital_info['teaching_status'] == 'Teaching' else 0
        urban_rural = 1 if hospital_info['urban_rural'] == 'Urban' else 0
        
        # Region encoding
        region_mapping = {'West': 0, 'Midwest': 1, 'South': 2, 'Northeast': 3, 'Other': 4}
        region_encoded = region_mapping.get(hospital_info['region'], 4)
        
        # Derived features
        beds_per_volume = beds / max(patient_volume, 1)
        volume_per_bed = patient_volume / max(beds, 1)
        rating_squared = rating ** 2
        
        return [
            beds, rating, patient_volume, response_rate, teaching_status, urban_rural,
            region_encoded, beds_per_volume, volume_per_bed, rating_squared
        ]
    
    def train_models(self, features: np.ndarray, targets: Dict[str, np.ndarray]) -> Dict:
        """Train multiple machine learning models for each HCAHPS metric"""
        models = {}
        
        for metric, target_values in targets.items():
            logger.info(f"Training models for {metric}")
            
            # Remove any invalid target values
            valid_indices = ~np.isnan(target_values) & (target_values > 0)
            if np.sum(valid_indices) < 10:  # Need minimum data points
                logger.warning(f"Insufficient data for {metric}")
                continue
            
            X = features[valid_indices]
            y = target_values[valid_indices]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=None
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Feature selection
            selector = SelectKBest(score_func=f_regression, k=min(8, X_train.shape[1]))
            X_train_selected = selector.fit_transform(X_train_scaled, y_train)
            X_test_selected = selector.transform(X_test_scaled)
            
            # Store scaler and selector
            self.scalers[metric] = scaler
            self.feature_selectors[metric] = selector
            
            # Train multiple models
            model_candidates = {
                'linear_regression': LinearRegression(),
                'ridge_regression': Ridge(alpha=1.0),
                'lasso_regression': Lasso(alpha=0.1),
                'elastic_net': ElasticNet(alpha=0.1, l1_ratio=0.5),
                'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
                'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
            }
            
            best_score = -1
            best_model = None
            best_model_name = None
            model_scores = {}
            
            for model_name, model in model_candidates.items():
                try:
                    # Train model
                    model.fit(X_train_selected, y_train)
                    
                    # Make predictions
                    y_pred = model.predict(X_test_selected)
                    
                    # Calculate metrics
                    r2 = r2_score(y_test, y_pred)
                    mse = mean_squared_error(y_test, y_pred)
                    mae = mean_absolute_error(y_test, y_pred)
                    
                    model_scores[model_name] = {
                        'r2_score': r2,
                        'mse': mse,
                        'mae': mae
                    }
                    
                    # Cross-validation
                    cv_scores = cross_val_score(model, X_train_selected, y_train, cv=5, scoring='r2')
                    model_scores[model_name]['cv_mean'] = cv_scores.mean()
                    model_scores[model_name]['cv_std'] = cv_scores.std()
                    
                    if r2 > best_score:
                        best_score = r2
                        best_model = model
                        best_model_name = model_name
                        
                except Exception as e:
                    logger.error(f"Error training {model_name} for {metric}: {e}")
                    continue
            
            # Store best model and performance metrics
            if best_model is not None:
                models[metric] = {
                    'best_model': best_model,
                    'best_model_name': best_model_name,
                    'performance': model_scores,
                    'best_score': best_score
                }
                
                # Get feature importance
                self._extract_feature_importance(metric, best_model, best_model_name, selector)
                
                # Store model performance
                self.model_performance[metric] = model_scores[best_model_name]
                
                logger.info(f"Best model for {metric}: {best_model_name} (R² = {best_score:.3f})")
        
        return models
    
    def _extract_feature_importance(self, metric: str, model, model_name: str, selector):
        """Extract feature importance from trained model"""
        try:
            if model_name in ['random_forest', 'gradient_boosting']:
                # Tree-based models have built-in feature importance
                importance = model.feature_importances_
            elif model_name in ['linear_regression', 'ridge_regression', 'lasso_regression', 'elastic_net']:
                # Linear models use coefficients
                importance = np.abs(model.coef_)
            else:
                importance = np.ones(selector.get_support().sum())
            
            # Map back to original feature names
            selected_features = selector.get_support()
            full_importance = np.zeros(len(self.feature_names))
            full_importance[selected_features] = importance
            
            self.feature_importance[metric] = {
                'importance': full_importance.tolist(),
                'feature_names': self.feature_names,
                'selected_features': selected_features.tolist()
            }
            
        except Exception as e:
            logger.error(f"Error extracting feature importance for {metric}: {e}")
    
    def predict_metrics(self, hospital_features: List[float], metrics: List[str]) -> Tuple[Dict, Dict, Dict]:
        """Predict HCAHPS metrics for a hospital"""
        predictions = {}
        confidence = {}
        factors = {}
        
        for metric in metrics:
            if metric in self.models:
                try:
                    model_info = self.models[metric]
                    model = model_info['best_model']
                    scaler = self.scalers[metric]
                    selector = self.feature_selectors[metric]
                    
                    # Prepare features
                    features_array = np.array([hospital_features])
                    features_scaled = scaler.transform(features_array)
                    features_selected = selector.transform(features_scaled)
                    
                    # Make prediction
                    prediction = model.predict(features_selected)[0]
                    
                    # Ensure prediction is within reasonable bounds (0-100)
                    prediction = max(0, min(100, prediction))
                    
                    predictions[metric] = round(prediction, 1)
                    confidence[metric] = round(model_info['best_score'], 3)
                    
                    # Identify key factors
                    factors[metric] = self._get_key_factors(metric, hospital_features)
                    
                except Exception as e:
                    logger.error(f"Error predicting {metric}: {e}")
                    predictions[metric] = 0.0
                    confidence[metric] = 0.0
                    factors[metric] = []
        
        return predictions, confidence, factors
    
    def _get_key_factors(self, metric: str, hospital_features: List[float]) -> List[str]:
        """Get key factors influencing the prediction"""
        try:
            if metric not in self.feature_importance:
                return []
            
            importance_data = self.feature_importance[metric]
            importance = np.array(importance_data['importance'])
            feature_names = importance_data['feature_names']
            
            # Get top 3 most important features
            top_indices = np.argsort(importance)[-3:][::-1]
            top_factors = []
            
            for idx in top_indices:
                if importance[idx] > 0.01:  # Only include meaningful factors
                    feature_name = feature_names[idx]
                    feature_value = hospital_features[idx]
                    
                    # Create human-readable factor description
                    factor_desc = self._format_factor_description(feature_name, feature_value)
                    top_factors.append(factor_desc)
            
            return top_factors
            
        except Exception as e:
            logger.error(f"Error getting key factors for {metric}: {e}")
            return []
    
    def _format_factor_description(self, feature_name: str, feature_value: float) -> str:
        """Format feature description for human readability"""
        factor_descriptions = {
            'beds': f"Hospital size ({feature_value:.0f} beds)",
            'rating': f"Overall rating ({feature_value:.1f}/5)",
            'patient_volume': f"Patient volume ({feature_value:,.0f})",
            'response_rate': f"Survey response rate ({feature_value:.1f}%)",
            'teaching_status': "Teaching hospital" if feature_value == 1 else "Non-teaching hospital",
            'urban_rural': "Urban location" if feature_value == 1 else "Rural location",
            'region_encoded': f"Geographic region",
            'beds_per_volume': f"Bed utilization ratio",
            'volume_per_bed': f"Patient volume per bed",
            'rating_squared': f"Rating performance"
        }
        
        return factor_descriptions.get(feature_name, feature_name)
    
    def get_model_performance_summary(self) -> Dict:
        """Get comprehensive model performance summary"""
        summary = {
            'overall_performance': {},
            'model_comparison': {},
            'feature_importance_summary': {}
        }
        
        # Overall performance metrics
        if self.model_performance:
            r2_scores = [perf['r2_score'] for perf in self.model_performance.values()]
            summary['overall_performance'] = {
                'average_r2': np.mean(r2_scores),
                'best_r2': np.max(r2_scores),
                'worst_r2': np.min(r2_scores),
                'total_models': len(self.model_performance)
            }
        
        # Model comparison
        model_types = {}
        for metric, perf in self.model_performance.items():
            model_name = self.models[metric]['best_model_name']
            if model_name not in model_types:
                model_types[model_name] = []
            model_types[model_name].append(perf['r2_score'])
        
        for model_name, scores in model_types.items():
            summary['model_comparison'][model_name] = {
                'count': len(scores),
                'average_r2': np.mean(scores),
                'std_r2': np.std(scores)
            }
        
        # Feature importance summary
        if self.feature_importance:
            all_importance = []
            for metric, importance_data in self.feature_importance.items():
                all_importance.append(importance_data['importance'])
            
            avg_importance = np.mean(all_importance, axis=0)
            summary['feature_importance_summary'] = {
                'average_importance': avg_importance.tolist(),
                'feature_names': self.feature_names,
                'top_features': [self.feature_names[i] for i in np.argsort(avg_importance)[-5:][::-1]]
            }
        
        return summary
    
    def save_models(self, filepath: str):
        """Save trained models to disk"""
        try:
            model_data = {
                'models': self.models,
                'scalers': self.scalers,
                'feature_selectors': self.feature_selectors,
                'feature_importance': self.feature_importance,
                'model_performance': self.model_performance,
                'feature_names': self.feature_names
            }
            
            joblib.dump(model_data, filepath)
            logger.info(f"Models saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving models: {e}")
    
    def load_models(self, filepath: str):
        """Load trained models from disk"""
        try:
            model_data = joblib.load(filepath)
            
            self.models = model_data['models']
            self.scalers = model_data['scalers']
            self.feature_selectors = model_data['feature_selectors']
            self.feature_importance = model_data['feature_importance']
            self.model_performance = model_data['model_performance']
            self.feature_names = model_data['feature_names']
            
            logger.info(f"Models loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def generate_insights(self, hospital_data: Dict, predictions: Dict) -> List[Dict]:
        """Generate actionable insights based on predictions and actual data"""
        insights = []
        
        for metric, predicted_value in predictions.items():
            if metric in hospital_data:
                actual_value = hospital_data[metric]
                gap = predicted_value - actual_value
                
                if gap > 5:
                    insights.append({
                        'type': 'opportunity',
                        'metric': metric,
                        'title': f'Potential for improvement in {metric.replace("_", " ").title()}',
                        'description': f'Predicted performance is {gap:.1f} points higher than current',
                        'current_score': actual_value,
                        'predicted_score': predicted_value,
                        'improvement_potential': gap,
                        'priority': 'high' if gap > 10 else 'medium'
                    })
                elif gap < -5:
                    insights.append({
                        'type': 'warning',
                        'metric': metric,
                        'title': f'Performance decline risk in {metric.replace("_", " ").title()}',
                        'description': f'Predicted performance is {abs(gap):.1f} points lower than current',
                        'current_score': actual_value,
                        'predicted_score': predicted_value,
                        'risk_level': abs(gap),
                        'priority': 'high' if abs(gap) > 10 else 'medium'
                    })
        
        return insights 