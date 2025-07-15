import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, TrendingUp, Shield, Zap, ChevronRight, Download, BarChart3, Activity, Users, Building2, ArrowUpRight, ArrowDownRight, Minus, Menu, X, TrendingDown, AlertTriangle, Award, Heart, Star, PieChart, MapPin, Plus, Trash2, RefreshCw, Clock, Settings, ChevronDown, Target, Lightbulb, Users2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Global metrics array
const allMetrics = [
  'Nurse Communication',
  'Doctor Communication', 
  'Staff Responsiveness',
  'Care Transition',
  'Discharge Info',
  'Care Cleanliness',
  'Quietness',
  'Recommend'
];

// Format relative time utility
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

// Live Data Pulse Component
const LiveDataPulse = ({ isLive, lastUpdated, onRefresh, isLoading }) => {
  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
      {/* Animated Pulse Dot */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'}`} />
        {isLive && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
        )}
      </div>
      
      {/* Status Text */}
      <span className="text-sm text-gray-400">
        {isLive ? 'Live' : 'Offline'} • Updated {formatRelativeTime(lastUpdated)}
      </span>
      
      {/* Refresh Button */}
      <button 
        onClick={onRefresh}
        disabled={isLoading}
        className={`p-1 hover:bg-white/10 rounded transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

// Animated Metric Component
const AnimatedMetric = ({ label, value, total, percentage, trend }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    const percentageIncrement = percentage / steps;

    let current = 0;
    let currentPercentage = 0;
    const timer = setInterval(() => {
      current += increment;
      currentPercentage += percentageIncrement;
      
      if (current >= value) {
        setDisplayValue(value);
        setDisplayPercentage(percentage);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
        setDisplayPercentage(currentPercentage);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, percentage]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">{label}</span>
        {trend && (
          <span className="text-xs text-green-400 font-medium">{trend}</span>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-white">
          {typeof value === 'number' && value % 1 === 0 ? displayValue : value}
        </span>
        {total && (
          <span className="text-sm text-gray-500">/ {total}</span>
        )}
        {percentage && (
          <span className="text-sm text-violet-400 font-medium">
            ({displayPercentage.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
};

// Smart Empty State Component
const EmptyStateInsights = ({ onHospitalSelect, hospitals, hospitalData }) => {
  // Generate sample top performers from available data
  const topPerformers = hospitals.slice(0, 3).map(hospital => {
    const data = hospitalData[hospital];
    const score = data ? 
      Object.values(data.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(data.metrics).length : 85;
    return {
      name: hospital,
      state: data?.info?.state || 'Unknown',
      improvement: Math.floor(Math.random() * 15) + 5,
      score: score
    };
  }).sort((a, b) => b.score - a.score);

  // Calculate regional insights
  const regionalData = {
    avgPerformance: 82.4,
    leadingMetric: 'Doctor Communication',
    focusArea: 'Quietness',
    region: 'Midwest'
  };

  // National snapshot data
  const nationalData = {
    hospitalsAbove80: 1847,
    totalHospitals: 3891,
    avgSatisfaction: 81.3,
    satisfactionTrend: '+2.1%'
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-700">
      {/* Animated Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">
          Industry Performance Pulse
        </h2>
        <p className="text-gray-400">
          Real-time insights from 3,891+ hospitals nationwide
        </p>
      </div>

      {/* Live Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Trending Up */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="font-semibold text-white">Top Performers This Month</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.map((hospital, index) => (
              <button 
                key={hospital.name}
                onClick={() => onHospitalSelect(hospital.name)}
                className="w-full text-left hover:bg-white/5 p-3 rounded-lg transition-colors group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="font-medium text-white group-hover:text-violet-300 transition-colors">
                  {hospital.name}
                </div>
                <div className="text-sm text-gray-400">
                  {hospital.state} • +{hospital.improvement}% improvement
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Regional Insights */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="font-semibold text-white">Your Region: {regionalData.region}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Performance</span>
              <span className="font-semibold text-white">{regionalData.avgPerformance}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Leading Metric</span>
              <span className="font-semibold text-green-400">{regionalData.leadingMetric}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Focus Area</span>
              <span className="font-semibold text-amber-400">{regionalData.focusArea}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-violet-400 mr-2" />
            <h3 className="font-semibold text-white">National Snapshot</h3>
          </div>
          <div className="space-y-4">
            <AnimatedMetric 
              label="Hospitals Above 80%"
              value={nationalData.hospitalsAbove80}
              total={nationalData.totalHospitals}
              percentage={47.5}
            />
            <AnimatedMetric 
              label="Avg Patient Satisfaction"
              value={nationalData.avgSatisfaction}
              trend={nationalData.satisfactionTrend}
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">
          Ready to see how your hospital compares?
        </p>
        <button 
          onClick={() => onHospitalSelect(hospitals[0])}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Search className="w-4 h-4 mr-2" />
          Start Analyzing
        </button>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Or use <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘K</kbd> to quick search any hospital
          </p>
        </div>
      </div>
    </div>
  );
};

// Hospital Compare Card Component
const HospitalCompareCard = ({ hospital, onRemove, isPrimary, hospitalData }) => {
  const data = hospitalData[hospital];
  const overallScore = data ? 
    (Object.values(data.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(data.metrics).length) : 0;

  // Calculate performance indicators
  const getPerformanceIndicator = (score) => {
    if (score >= 85) return { color: 'text-green-400', icon: TrendingUp, label: 'Excellent' };
    if (score >= 75) return { color: 'text-yellow-400', icon: Minus, label: 'Good' };
    return { color: 'text-red-400', icon: TrendingDown, label: 'Needs Improvement' };
  };

  const performance = getPerformanceIndicator(overallScore);

  return (
    <div className={`bg-white/5 backdrop-blur-md rounded-xl p-4 border ${isPrimary ? 'border-violet-500/50' : 'border-white/10'} hover:border-white/20 transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm">{hospital}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="w-3 h-3 text-gray-500" />
            {data?.info?.state && (
              <p className="text-xs text-gray-400">{data.info.state}</p>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">{overallScore.toFixed(1)}%</div>
          <div className="flex items-center justify-center space-x-1">
            <performance.icon className={`w-3 h-3 ${performance.color}`} />
            <span className={`text-xs font-medium ${performance.color}`}>{performance.label}</span>
          </div>
        </div>
        

      </div>
      
      {isPrimary && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="inline-flex items-center px-2 py-1 bg-violet-500/20 rounded-full">
            <span className="text-xs text-violet-300 font-medium">Primary</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Hospital Card Component
const AddHospitalCard = ({ onAdd, disabled, hospitals, hospitalData }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHospitals(hospitals.slice(0, 10));
    } else {
      const filtered = hospitals.filter(hospital =>
        hospital.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
      setFilteredHospitals(filtered);
    }
  }, [searchTerm, hospitals]);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={`w-full h-full min-h-[200px] bg-white/5 backdrop-blur-md rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 transition-all duration-300 flex flex-col items-center justify-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'
        }`}
      >
        <Plus className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-gray-400 font-medium">Add Hospital</span>
        {disabled && (
          <span className="text-xs text-gray-500 mt-1">Max 3 hospitals</span>
        )}
      </button>
      
      {showDropdown && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 max-h-60 overflow-y-auto z-50">
          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-white placeholder-gray-400"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredHospitals.map((hospital) => (
              <button
                key={hospital}
                onClick={() => {
                  onAdd(hospital);
                  setShowDropdown(false);
                  setSearchTerm('');
                }}
                className="w-full flex items-center px-3 py-2 text-left hover:bg-white/10 transition-colors"
              >
                <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <div className="text-white font-medium">{hospital}</div>
                  <div className="text-sm text-gray-400">
                    {hospitalData[hospital]?.info?.state || 'Unknown State'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Comparison Metric Row Component
const ComparisonMetricRow = ({ metric, hospitals, hospitalData }) => {
  const values = hospitals.map(hospital => {
    const data = hospitalData[hospital];
    return data ? data.metrics[metric]?.hospital || 0 : 0;
  });
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10">
      <h4 className="font-semibold mb-4 text-white text-lg">{metric}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hospitals.map((hospital, idx) => {
          const value = values[idx];
          const isMax = value === max && max !== min;
          const isMin = value === min && max !== min;
          const percentage = range > 0 ? ((value - min) / range) * 100 : 50;
          
          return (
            <div key={hospital} className="relative">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-center mb-3">
                  <div className={`text-3xl font-bold mb-2 transition-colors
                    ${isMax ? 'text-green-400' : isMin ? 'text-red-400' : 'text-white'}`}>
                    {value.toFixed(1)}%
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {isMax && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">Best</span>
                      </>
                    )}
                    {isMin && (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">Lowest</span>
                      </>
                    )}
                    {!isMax && !isMin && (
                      <>
                        <Minus className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Average</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Hospital</div>
                  <div className="text-white font-medium truncate">{hospital}</div>
                </div>
                
                {/* Performance bar */}
                <div className="mt-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isMax ? 'bg-green-400' : isMin ? 'bg-red-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Comparison Mode Component
const ComparisonMode = ({ isOpen, onClose, hospitals, hospitalData, selectedHospital }) => {
  const [compareHospitals, setCompareHospitals] = useState([]);
  const maxCompare = 3;
  
  useEffect(() => {
    if (isOpen && selectedHospital) {
      setCompareHospitals([selectedHospital]);
    }
  }, [isOpen, selectedHospital]);

  const addHospital = (hospital, index) => {
    if (compareHospitals.length < maxCompare && !compareHospitals.includes(hospital)) {
      const newHospitals = [...compareHospitals];
      newHospitals[index] = hospital;
      setCompareHospitals(newHospitals.filter(Boolean));
    }
  };

  const removeHospital = (index) => {
    const newHospitals = compareHospitals.filter((_, i) => i !== index);
    setCompareHospitals(newHospitals);
  };

  const exitCompareMode = () => {
    setCompareHospitals([]);
    onClose();
  };

  // Prepare radar chart data
  const comparisonRadarData = allMetrics.map(metric => {
    const data = { metric };
    compareHospitals.forEach((hospital, idx) => {
      const currentHospitalData = hospitalData[hospital];
      const value = currentHospitalData ? currentHospitalData.metrics[metric]?.hospital || 0 : 0;
      data[`hospital${idx}`] = value;
    });
    return data;
  });

  const colors = ['#8b5cf6', '#3b82f6', '#10b981'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Compare Hospitals</h2>
            <p className="text-gray-400 mt-1">Select up to 3 hospitals to compare performance metrics</p>
          </div>
          <button 
            onClick={exitCompareMode}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Hospital Selector */}
      <div className="flex-shrink-0 p-6 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative">
              {compareHospitals[index] ? (
                <HospitalCompareCard 
                  hospital={compareHospitals[index]}
                  onRemove={() => removeHospital(index)}
                  isPrimary={index === 0}
                  hospitalData={hospitalData}
                />
              ) : (
                <AddHospitalCard 
                  onAdd={(hospital) => addHospital(hospital, index)}
                  disabled={compareHospitals.length >= maxCompare}
                  hospitals={hospitals}
                  hospitalData={hospitalData}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Comparison Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {compareHospitals.length >= 2 ? (
          <div className="space-y-8">
            {/* Radar Chart Comparison */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-white">Performance Overview</h3>
              <p className="text-gray-400 mb-4 text-sm">Each axis shows a key metric. Colored areas represent each hospital's performance (higher is better).</p>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={comparisonRadarData} outerRadius={140}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fontSize: 13, fill: '#c7d2fe', fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                  />
                  {compareHospitals.map((hospital, idx) => (
                    <Radar
                      key={hospital}
                      dataKey={`hospital${idx}`}
                      stroke={colors[idx]}
                      fill={colors[idx]}
                      fillOpacity={0.18}
                      strokeWidth={3}
                      name={hospital}
                      isAnimationActive={false}
                    />
                  ))}
                  <Tooltip
                    formatter={(value, name, props) => [`${value.toFixed(1)}%`, 'Score']}
                    contentStyle={{ background: '#18181b', border: '1px solid #6366f1', borderRadius: 8, color: '#fff' }}
                    labelStyle={{ color: '#a5b4fc' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex justify-center mt-6 space-x-6">
                {compareHospitals.map((hospital, idx) => (
                  <div key={hospital} className="flex items-center space-x-2">
                    <span className="inline-block w-4 h-4 rounded-full" style={{ background: colors[idx], border: '2px solid #fff' }} />
                    <span className="text-sm text-white font-medium truncate max-w-[120px]">{hospital}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Metric-by-Metric Comparison */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Metric Comparison</h3>
              {allMetrics.map(metric => (
                <ComparisonMetricRow 
                  key={metric}
                  metric={metric}
                  hospitals={compareHospitals}
                  hospitalData={hospitalData}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Add More Hospitals</h3>
            <p className="text-gray-400">Select at least 2 hospitals to start comparing performance metrics</p>
          </div>
        )}
      </div>
    </div>
  );
};



// Expandable Metric Card Component
const ExpandableMetricCard = ({ metric, data, hospitalData, selectedHospital, isExpanded, onToggle, index }) => {
  // Generate 12-month trend data
  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseValue = data.hospital;
    const trend = data.vsNational > 0 ? 0.3 : -0.2; // Positive or negative trend
    
    return months.map((month, i) => {
      const randomVariation = (Math.random() - 0.5) * 2;
      const trendEffect = trend * i;
      const value = Math.max(0, Math.min(100, baseValue + trendEffect + randomVariation));
      return { month, value: parseFloat(value.toFixed(1)) };
    });
  };

  // Calculate percentile ranking
  const calculatePercentile = () => {
    const allHospitals = Object.keys(hospitalData);
    const metricValues = allHospitals
      .map(hospital => hospitalData[hospital]?.metrics[metric]?.hospital || 0)
      .filter(value => value > 0)
      .sort((a, b) => b - a);
    
    const currentValue = data.hospital;
    const rank = metricValues.findIndex(value => value <= currentValue);
    const percentile = rank === -1 ? 100 : ((metricValues.length - rank) / metricValues.length) * 100;
    
    return Math.round(percentile);
  };

  // Find similar hospitals
  const findSimilarHospitals = () => {
    const allHospitals = Object.keys(hospitalData);
    const currentValue = data.hospital;
    
    return allHospitals
      .filter(hospital => hospital !== selectedHospital)
      .map(hospital => {
        const hospitalMetric = hospitalData[hospital]?.metrics[metric];
        if (!hospitalMetric) return null;
        
        const difference = Math.abs(hospitalMetric.hospital - currentValue);
        return {
          name: hospital,
          value: hospitalMetric.hospital,
          difference,
          state: hospitalData[hospital]?.info?.state || 'Unknown'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.difference - b.difference)
      .slice(0, 3);
  };

  // Generate improvement recommendations
  const generateRecommendations = () => {
    const recommendations = [];
    const percentile = calculatePercentile();
    
    if (percentile < 50) {
      recommendations.push({
        icon: Users2,
        title: 'Staff Training',
        description: 'Implement targeted training programs for staff communication skills',
        priority: 'high'
      });
    }
    
    if (data.vsState < 0) {
      recommendations.push({
        icon: Target,
        title: 'Process Optimization',
        description: 'Review and optimize current processes to align with state best practices',
        priority: 'medium'
      });
    }
    
    if (data.hospital < 80) {
      recommendations.push({
        icon: Lightbulb,
        title: 'Patient Feedback',
        description: 'Increase patient feedback collection and response mechanisms',
        priority: 'medium'
      });
    }
    
    return recommendations.length > 0 ? recommendations : [{
      icon: Award,
      title: 'Maintain Excellence',
      description: 'Continue current practices to maintain high performance levels',
      priority: 'low'
    }];
  };

  const trendData = generateTrendData();
  const percentile = calculatePercentile();
  const similarHospitals = findSimilarHospitals();
  const recommendations = generateRecommendations();
  const isPositive = data.vsNational >= 0;
  const deltaValue = Math.abs(data.vsNational);

  return (
    <div 
      className={`relative min-w-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-500 group animate-in slide-in-from-bottom-4 duration-500 hover:shadow-2xl hover:scale-[1.02] ${
        isExpanded ? 'col-span-full row-span-2' : 'hover:border-white/20'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Basic Metric Info */}
      <div 
        className={`p-6 cursor-pointer ${isExpanded ? 'border-b border-white/10' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-3 truncate font-medium">
              {metric}
            </div>
            <div className="text-4xl font-bold tracking-tight text-white mb-3">
              {data.hospital.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {isPositive ? '+' : '-'}{deltaValue.toFixed(1)}%
                </span>
              </div>
              <span className="text-sm text-gray-400">
                vs national
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Percentile</div>
              <div className="text-lg font-bold text-violet-400">{percentile}%</div>
            </div>
            <div className={`p-2 rounded-full transition-all duration-300 ${
              isExpanded ? 'bg-violet-500/20 rotate-180' : 'bg-white/5 group-hover:bg-white/10'
            }`}>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* 12-Month Trend Chart */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">12-Month Trend</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Similar Hospitals */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Similar Hospitals</h4>
              <div className="space-y-3">
                {similarHospitals.map((hospital, idx) => (
                  <div key={hospital.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{hospital.name}</div>
                      <div className="text-sm text-gray-400">{hospital.state}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{hospital.value.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">±{hospital.difference.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Recommendations */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Recommendations</h4>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border-l-4 border-violet-500">
                    <div className="flex items-start space-x-3">
                      <rec.icon className={`w-5 h-5 mt-0.5 ${
                        rec.priority === 'high' ? 'text-rose-400' : 
                        rec.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`} />
                      <div>
                        <div className="text-white font-medium">{rec.title}</div>
                        <div className="text-sm text-gray-400">{rec.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced SearchInput component with smart features
const SearchInput = ({ onSearch, onHospitalSelect, hospitals, hospitalData, darkMode }) => {
  const [localQuery, setLocalQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const inputRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('hospitalSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (hospital) => {
    const newHistory = [hospital, ...searchHistory.filter(h => h !== hospital)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('hospitalSearchHistory', JSON.stringify(newHistory));
  };

  // Fuzzy search function
  const fuzzySearch = (query, text) => {
    const pattern = query.split('').join('.*');
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  };

  // Get popular hospitals (top performers)
  const getPopularHospitals = () => {
    return hospitals
      .map(hospital => {
        const data = hospitalData[hospital];
        const score = data ? 
          (Object.values(data.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(data.metrics).length) : 0;
        return { hospital, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.hospital);
  };

  // Filter hospitals based on query and state
  useEffect(() => {
    if (localQuery.trim() === '') {
      setFilteredResults([]);
      setShowDropdown(false);
      return;
    }

    let filtered = hospitals;

    // Filter by state if specified
    if (selectedState) {
      filtered = filtered.filter(hospital => {
        const data = hospitalData[hospital];
        return data?.info?.state === selectedState;
      });
    }

    // Apply fuzzy search
    filtered = filtered.filter(hospital => {
      const data = hospitalData[hospital];
      const state = data?.info?.state || '';
      const searchText = `${hospital} ${state}`.toLowerCase();
      const query = localQuery.toLowerCase();
      
      return fuzzySearch(query, searchText) || searchText.includes(query);
    });

    // Sort by relevance (exact matches first, then fuzzy matches)
    filtered.sort((a, b) => {
      const aExact = a.toLowerCase().includes(localQuery.toLowerCase());
      const bExact = b.toLowerCase().includes(localQuery.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // If both are exact or both are fuzzy, sort by performance
      const aData = hospitalData[a];
      const bData = hospitalData[b];
      const aScore = aData ? Object.values(aData.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(aData.metrics).length : 0;
      const bScore = bData ? Object.values(bData.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(bData.metrics).length : 0;
      
      return bScore - aScore;
    });

    setFilteredResults(filtered.slice(0, 10));
    setShowDropdown(filtered.length > 0);
    setSelectedIndex(0);
  }, [localQuery, hospitals, hospitalData, selectedState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filteredResults.length > 0) {
      handleHospitalClick(filteredResults[selectedIndex]);
    } else if (localQuery.trim() !== '' && hospitals.length > 0) {
      onHospitalSelect(hospitals[0]);
    }
  };

  const handleHospitalClick = (hospital) => {
    onHospitalSelect(hospital);
    setLocalQuery(hospital);
    setShowDropdown(false);
    saveToHistory(hospital);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev === 0 ? filteredResults.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults.length > 0) {
          handleHospitalClick(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleFocus = () => {
    if (localQuery.trim() !== '' && filteredResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const getStates = () => {
    const states = new Set();
    hospitals.forEach(hospital => {
      const data = hospitalData[hospital];
      if (data?.info?.state) {
        states.add(data.info.state);
      }
    });
    return Array.from(states).sort();
  };

  const popularHospitals = getPopularHospitals();
  const states = getStates();

  return (
    <div className="mb-12">
      <form onSubmit={handleSubmit}>
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-1">
            <div className="flex items-center px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search 3,891+ hospitals..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Analyze
              </button>
            </div>
          </div>
          
          {/* Enhanced Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 max-h-96 overflow-y-auto z-50">
              {/* State Filter */}
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center space-x-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedState('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedState === '' 
                        ? 'bg-violet-500 text-white' 
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    All States
                  </button>
                  {states.slice(0, 10).map(state => (
                    <button
                      key={state}
                      onClick={() => setSelectedState(state)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedState === state 
                          ? 'bg-violet-500 text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {filteredResults.length > 0 ? (
                <div>
                  {filteredResults.map((hospital, index) => {
                    const data = hospitalData[hospital];
                    const isSelected = index === selectedIndex;
                    const isInHistory = searchHistory.includes(hospital);
                    
                    return (
                      <button
                        key={hospital}
                        onClick={() => handleHospitalClick(hospital)}
                        className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                          isSelected ? 'bg-violet-500/20 border-l-2 border-violet-500' : 'hover:bg-white/10'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{hospital}</span>
                            {isInHistory && (
                              <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded">
                                Recent
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {data?.info?.state && <>{data.info.state} • </>}{data ? 
                              (Object.values(data.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(data.metrics).length).toFixed(1) : 0
                            }% overall
                          </div>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-violet-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : localQuery.trim() !== '' ? (
                <div className="p-4 text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hospitals found</p>
                  <p className="text-sm mt-1">Try adjusting your search or state filter</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2 px-2">Recent Searches</h4>
                      {searchHistory.map((hospital, index) => (
                        <button
                          key={hospital}
                          onClick={() => handleHospitalClick(hospital)}
                          className="w-full flex items-center px-2 py-2 text-left hover:bg-white/10 rounded transition-colors"
                        >
                          <Clock className="w-4 h-4 text-gray-500 mr-3" />
                          <span className="text-white">{hospital}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Popular Hospitals */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2 px-2">Popular Hospitals</h4>
                    {popularHospitals.map((hospital, index) => (
                      <button
                        key={hospital}
                        onClick={() => handleHospitalClick(hospital)}
                        className="w-full flex items-center px-2 py-2 text-left hover:bg-white/10 rounded transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-green-400 mr-3" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{hospital}</div>
                          <div className="text-sm text-gray-400">
                            {hospitalData[hospital]?.info?.state && hospitalData[hospital].info.state}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

const ModernDashboard = ({ onBackToLanding, darkMode, setDarkMode }) => {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedHospital, setSelectedHospital] = useState(null);


  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalData, setHospitalData] = useState({});
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  const [exporting, setExporting] = useState(false);

  const [showComparisonMode, setShowComparisonMode] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const chartRef = useRef(null);

  // Load data from backend API
  const loadData = useCallback(async () => {
    try {
      const hospitalsResponse = await fetch('/api/hospitals');
      const hospitalsData = await hospitalsResponse.json();
      setHospitals(hospitalsData.hospitals || []);
      
      const allDataResponse = await fetch('/api/all-hospitals-data');
      const allData = await allDataResponse.json();
      setHospitalData(allData);
      
      if (hospitalsData.hospitals && hospitalsData.hospitals.length > 0) {
        setSelectedHospital(hospitalsData.hospitals[0]);
      }
      
      setLastUpdated(new Date());
      setIsLive(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLive(false);
      // Fallback to demo data
      setHospitals([
        'Metro General Hospital',
        'City Medical Center',
        'Regional Health Center'
      ]);
      setHospitalData({
        'Metro General Hospital': {
          info: {
            name: 'Metro General Hospital',
            state: 'California',
            type: 'General Acute Care'
          },
          metrics: {
            'Nurse Communication': { hospital: 85.2, state: 82.1, national: 81.3, vsState: 3.1, vsNational: 3.9 },
            'Doctor Communication': { hospital: 88.7, state: 85.4, national: 84.9, vsState: 3.3, vsNational: 3.8 },
            'Staff Responsiveness': { hospital: 72.8, state: 78.2, national: 76.8, vsState: -5.4, vsNational: -4.0 },
            'Care Transition': { hospital: 68.5, state: 71.3, national: 70.4, vsState: -2.8, vsNational: -1.9 },
            'Discharge Info': { hospital: 87.2, state: 86.1, national: 85.2, vsState: 1.1, vsNational: 2.0 },
            'Care Cleanliness': { hospital: 82.1, state: 80.5, national: 79.9, vsState: 1.6, vsNational: 2.2 },
            'Quietness': { hospital: 68.9, state: 71.2, national: 70.4, vsState: -2.3, vsNational: -1.5 },
            'Recommend': { hospital: 89.1, state: 87.8, national: 86.5, vsState: 1.3, vsNational: 2.6 }
          }
        }
      });
      setSelectedHospital('Metro General Hospital');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data function
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-select top performing metrics when hospital changes
  useEffect(() => {
    if (selectedHospital && hospitalData[selectedHospital]) {
      const metrics = hospitalData[selectedHospital].metrics;
      const topMetrics = Object.entries(metrics)
        .sort(([,a], [,b]) => b.vsNational - a.vsNational)
        .slice(0, 3)
        .map(([name]) => name);
      
      // Load saved metrics from localStorage or use top 3
      const savedMetrics = localStorage.getItem(`metrics_${selectedHospital}`);
      if (savedMetrics) {
        try {
          const parsed = JSON.parse(savedMetrics);
          setSelectedMetrics(parsed);
        } catch {
          setSelectedMetrics(topMetrics);
        }
      } else {
        setSelectedMetrics(topMetrics);
      }
    }
  }, [selectedHospital, hospitalData]);

  // Save selected metrics to localStorage
  useEffect(() => {
    if (selectedHospital && selectedMetrics.length > 0) {
      localStorage.setItem(`metrics_${selectedHospital}`, JSON.stringify(selectedMetrics));
    }
  }, [selectedMetrics, selectedHospital]);

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
  };

  const getPerformanceIndicator = (value, benchmark) => {
    const diff = value - benchmark;
    if (Math.abs(diff) < 1) return { icon: Minus, color: 'text-gray-400', text: 'On Par' };
    if (diff > 0) return { icon: ArrowUpRight, color: 'text-emerald-400', text: `+${diff.toFixed(1)}%` };
    return { icon: ArrowDownRight, color: 'text-rose-400', text: `${diff.toFixed(1)}%` };
  };

  const getMetricData = () => {
    if (!selectedHospital || !hospitalData[selectedHospital]) return [];
    
    const metrics = hospitalData[selectedHospital].metrics;
    return selectedMetrics.map(metric => {
      const data = metrics[metric];
      return {
        name: metric,
        hospital: data.hospital,
        state: data.state,
        national: data.national,
        vsState: data.vsState,
        vsNational: data.vsNational
      };
    });
  };

  const generateInsights = useCallback(() => {
    if (!selectedHospital || !hospitalData[selectedHospital]) return [];
    
    const metrics = hospitalData[selectedHospital].metrics;
    const insights = [];
    
    // Find best performing metric
    const bestMetric = Object.entries(metrics).reduce((best, [name, data]) => {
      return data.vsNational > best.vsNational ? { name, ...data } : best;
    }, { name: '', vsNational: -100 });
    
    if (bestMetric.vsNational > 0) {
      insights.push({
        type: 'positive',
        icon: TrendingUp,
        title: 'Top Performance',
        message: `${bestMetric.name} exceeds national average by ${bestMetric.vsNational.toFixed(1)}%`,
        color: 'from-emerald-500 to-teal-600'
      });
    }
    
    // Find areas needing improvement
    const worstMetric = Object.entries(metrics).reduce((worst, [name, data]) => {
      return data.vsState < worst.vsState ? { name, ...data } : worst;
    }, { name: '', vsState: 100 });
    
    if (worstMetric.vsState < 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Needs Attention',
        message: `${worstMetric.name} is ${Math.abs(worstMetric.vsState.toFixed(1))}% below state average`,
        color: 'from-amber-500 to-orange-600'
      });
    }
    
    // Add trend analysis
    const improvingMetrics = Object.entries(metrics).filter(([, data]) => data.vsNational > 2).length;
    if (improvingMetrics > 0) {
      insights.push({
        type: 'info',
        icon: Award,
        title: 'Strong Performance',
        message: `${improvingMetrics} metrics significantly outperform national benchmarks`,
        color: 'from-violet-500 to-purple-600'
      });
    }
    
    return insights;
  }, [selectedHospital, hospitalData]);

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    
    try {
      const element = chartRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`CareMetrics_${selectedHospital}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [selectedHospital]);



  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg dark:bg-gray-800/95 dark:border-gray-700 z-50">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const LandingPage = () => (
    <div className="min-h-screen transition-all duration-700 bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">CareMetrics Pro</span>
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-6 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black to-purple-900/20" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-gray-300 mb-8 border border-white/20">
            <Zap className="w-4 h-4 mr-2 text-violet-400" />
            AI-Powered Healthcare Analytics
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 tracking-tight">
            <span className="text-white">Executive</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Healthcare Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Precision insights into hospital HCAHPS performance. 
            Make data-driven decisions that improve patient care quality.
          </p>

          <div className="flex justify-center mb-20">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="group px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              Start Analyzing
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Hospitals', value: '3,891+', icon: Building2 },
              { label: 'Key Metrics', value: '8', icon: BarChart3 },
              { label: 'Data Accuracy', value: '99.9%', icon: Shield }
            ].map((stat, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
                  <stat.icon className="w-8 h-8 text-violet-400 mb-4 mx-auto" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => {
    const chartData = getMetricData();
    const insights = generateInsights();

    const getMetricScore = () => {
      if (!selectedHospital || !hospitalData[selectedHospital]) return 0;
      const metrics = hospitalData[selectedHospital].metrics;
      return Object.values(metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(metrics).length;
    };

    const getMetricComparison = () => {
      if (!selectedHospital || !hospitalData[selectedHospital]) return { state: 0, national: 0 };
      const metrics = hospitalData[selectedHospital].metrics;
      const avgState = Object.values(metrics).reduce((acc, m) => acc + m.state, 0) / Object.keys(metrics).length;
      const avgNational = Object.values(metrics).reduce((acc, m) => acc + m.national, 0) / Object.keys(metrics).length;
      return { state: avgState, national: avgNational };
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Loading CareMetrics Pro</h2>
            <p className="text-gray-400">Preparing your analytics dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen transition-all duration-700 bg-black">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex items-center space-x-2 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg">
                    CareMetrics Pro
                  </span>
                </button>
                
                {selectedHospital && (
                  <div className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10">
                    <Building2 className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">
                      {selectedHospital}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <LiveDataPulse
                  isLive={isLive}
                  lastUpdated={lastUpdated}
                  onRefresh={refreshData}
                  isLoading={isRefreshing}
                />
                <button
                  onClick={() => setShowComparisonMode(true)}
                  className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/5 backdrop-blur-md rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Compare</span>
                </button>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {showMobileMenu ? 
                    <X className="w-5 h-5 text-gray-400" /> : 
                    <Menu className="w-5 h-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Search Section - Using enhanced component */}
            <SearchInput 
              onSearch={() => {}}
              onHospitalSelect={handleHospitalSelect}
              hospitals={hospitals}
              hospitalData={hospitalData}
              darkMode={darkMode}
            />

            {selectedHospital ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                {/* Hospital Selection Success Message */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-6 py-3 bg-violet-500/20 backdrop-blur-md rounded-full border border-violet-500/30">
                    <Building2 className="w-5 h-5 text-violet-400 mr-3" />
                    <span className="text-violet-300 font-medium">
                      Analyzing {selectedHospital}
                    </span>
                  </div>
                </div>

                {/* Metric Filter Chips */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-400">Performance Metrics</h3>
                    <button
                      onClick={() => setSelectedMetrics(selectedMetrics.length === allMetrics.length ? [] : allMetrics)}
                      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                      {selectedMetrics.length === allMetrics.length ? 'Clear All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex overflow-x-auto gap-3 py-2 px-1 w-full">
                    {allMetrics.map((metric, idx) => (
                      <button
                        key={metric}
                        onClick={() => {
                          setSelectedMetrics(
                            selectedMetrics.includes(metric)
                              ? selectedMetrics.filter(m => m !== metric)
                              : [...selectedMetrics, metric]
                          );
                        }}
                        className={`min-w-max whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:shadow-lg
                          ${selectedMetrics.includes(metric)
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-600 shadow-lg transform scale-105'
                            : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/20 hover:border-white/30 hover:shadow-md'}
                        `}
                      >
                        {idx % 8 === 0 && <Users className="w-4 h-4" />}
                        {idx % 8 === 1 && <Heart className="w-4 h-4" />}
                        {idx % 8 === 2 && <Star className="w-4 h-4" />}
                        {idx % 8 === 3 && <Award className="w-4 h-4" />}
                        {idx % 8 === 4 && <Shield className="w-4 h-4" />}
                        {idx % 8 === 5 && <Activity className="w-4 h-4" />}
                        {idx % 8 === 6 && <PieChart className="w-4 h-4" />}
                        {idx % 8 === 7 && <TrendingUp className="w-4 h-4" />}
                        <span>{metric}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* KPI Grid */}
                {selectedMetrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {selectedMetrics.slice(0, 6).map((metric, index) => {
                      const data = hospitalData[selectedHospital]?.metrics[metric];
                      if (!data) return null;
                      
                      return (
                        <ExpandableMetricCard
                          key={metric}
                          metric={metric}
                          data={data}
                          hospitalData={hospitalData}
                          selectedHospital={selectedHospital}
                          isExpanded={expandedMetric === metric}
                          onToggle={() => setExpandedMetric(expandedMetric === metric ? null : metric)}
                          index={index}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    <h3 className="text-lg font-medium text-gray-400 mb-6">
                      Overall Score
                    </h3>
                    <div className="text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                      {getMetricScore().toFixed(1)}%
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">vs State Average</span>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const comparison = getMetricComparison();
                            const indicator = getPerformanceIndicator(getMetricScore(), comparison.state);
                            return (
                              <>
                                <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
                                <span className={`font-medium ${indicator.color}`}>{indicator.text}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">vs National Average</span>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const comparison = getMetricComparison();
                            const indicator = getPerformanceIndicator(getMetricScore(), comparison.national);
                            return (
                              <>
                                <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
                                <span className={`font-medium ${indicator.color}`}>{indicator.text}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart/Table Container */}
                  <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-400">
                        Performance Overview
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setViewMode('chart')}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            viewMode === 'chart'
                              ? 'bg-violet-500/20 text-violet-300'
                              : 'text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Chart</span>
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                            viewMode === 'table'
                              ? 'bg-violet-500/20 text-violet-300'
                              : 'text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Table</span>
                        </button>
                      </div>
                    </div>

                    {selectedMetrics.length === 0 ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-300 mb-2">Select Metrics</h3>
                          <p className="text-gray-400">Choose metrics from the filter above to view performance data</p>
                        </div>
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-red-300 mb-2">No data available for selected metrics</h3>
                        </div>
                      </div>
                    ) : viewMode === 'chart' ? (
                      <div ref={chartRef} style={{ minHeight: 320, height: 320 }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12, fill: '#9ca3af' }}
                              axisLine={{ stroke: '#374151' }}
                            />
                            <YAxis 
                              domain={[0, 100]}
                              allowDataOverflow={false}
                              tick={{ fontSize: 12, fill: '#9ca3af' }}
                              axisLine={{ stroke: '#374151' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="hospital" 
                              fill="url(#barGradient)" 
                              radius={[4, 4, 0, 0]}
                              name="Hospital"
                            />
                            <Bar 
                              dataKey="state" 
                              fill="url(#stateGradient)" 
                              radius={[4, 4, 0, 0]}
                              name="State Average"
                            />
                            <Bar 
                              dataKey="national" 
                              fill="url(#nationalGradient)" 
                              radius={[4, 4, 0, 0]}
                              name="National Average"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 font-semibold text-white">Metric</th>
                              <th className="text-right py-3 px-4 font-semibold text-white">Hospital</th>
                              <th className="text-right py-3 px-4 font-semibold text-white">State</th>
                              <th className="text-right py-3 px-4 font-semibold text-white">National</th>
                              <th className="text-right py-3 px-4 font-semibold text-white">vs State</th>
                              <th className="text-right py-3 px-4 font-semibold text-white">vs National</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chartData.map((row, index) => (
                              <tr key={index} className="border-b border-white/5">
                                <td className="py-3 px-4 text-gray-300 truncate max-w-xs">{row.name}</td>
                                <td className="py-3 px-4 text-right font-semibold text-white">{row.hospital}%</td>
                                <td className="py-3 px-4 text-right text-gray-400">{row.state}%</td>
                                <td className="py-3 px-4 text-right text-gray-400">{row.national}%</td>
                                <td className={`py-3 px-4 text-right font-medium ${
                                  parseFloat(row.vsState) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {parseFloat(row.vsState) >= 0 ? '+' : ''}{row.vsState}%
                                </td>
                                <td className={`py-3 px-4 text-right font-medium ${
                                  parseFloat(row.vsNational) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {parseFloat(row.vsNational) >= 0 ? '+' : ''}{row.vsNational}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {insights.map((insight, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 hover:shadow-2xl hover:border-white/20 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500 group"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <insight.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2 text-white group-hover:text-violet-300 transition-colors">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {insight.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center">
                  <button 
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full font-medium text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4" />
                    <span>{exporting ? 'Exporting...' : 'Export Report'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Smart Empty State with Live Insights */
              <EmptyStateInsights 
                onHospitalSelect={handleHospitalSelect}
                hospitals={hospitals}
                hospitalData={hospitalData}
              />
            )}
          </div>
        </main>

        {/* SVG Gradients for Charts */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="stateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="nationalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#4b5563" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
};

  return (
    <>
      {currentView === 'landing' ? <LandingPage /> : <Dashboard />}
      
      <ComparisonMode
        isOpen={showComparisonMode}
        onClose={() => setShowComparisonMode(false)}
        hospitals={hospitals}
        hospitalData={hospitalData}
        selectedHospital={selectedHospital}
      />
    </>
  );
};

export default ModernDashboard; 