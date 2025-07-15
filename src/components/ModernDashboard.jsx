import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  TrendingUp, 
  TrendingDown,
  Award, 
  Download, 
  Search, 
  Heart, 
  Star, 
  Users, 
  Shield, 
  Activity, 
  PieChart, 
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Settings,
  FileText,
  Expand,
  Minimize,
  AlertTriangle,
  BarChart3,
  Table2,
  Mail,
  Building2,
  X,
  Check,
  ChevronDown
} from 'lucide-react';

// Animated Number Component for smooth number transitions
const AnimatedMetric = ({ value, duration = 1000, prefix = '', suffix = '%' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = parseFloat(value);
    
    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };
    
    requestAnimationFrame(updateValue);
  }, [value]);
  
  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toFixed(1)}{suffix}
    </span>
  );
};

// Magnetic Hover Effect for Cards
const MagneticCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const angle = Math.atan2(y, x);
    const distance = Math.min(Math.sqrt(x * x + y * y), 40);
    const translateX = Math.cos(angle) * distance * 0.1;
    const translateY = Math.sin(angle) * distance * 0.1;
    
    setTransform(`translate(${translateX}px, ${translateY}px)`);
  };
  
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTransform('')}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform }}
    >
      {children}
    </div>
  );
};

// Sparkline Component
const Sparkline = ({ data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo-400"
      />
    </svg>
  );
};

// Metric With Sparkline on Hover
const MetricWithSparkline = ({ metric, data }) => {
  const [showSparkline, setShowSparkline] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowSparkline(true)}
      onMouseLeave={() => setShowSparkline(false)}
    >
      <AnimatedMetric value={metric} />
      
      {showSparkline && data && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-32 h-12 
                        bg-black/80 backdrop-blur-sm rounded-lg p-2 z-10
                        animate-in fade-in slide-in-from-top-1">
          <Sparkline data={data} />
        </div>
      )}
    </div>
  );
};

const ModernDashboard = ({ onBackToLanding, darkMode, setDarkMode }) => {
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalData, setHospitalData] = useState({});
  const [exporting, setExporting] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [insightTab, setInsightTab] = useState('overview');
  const [dashboardMode, setDashboardMode] = useState('summary'); // 'summary' or 'expanded'
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const chartRef = useRef(null);
  const modalInputRef = useRef(null);

  // Fuzzy search function
  const fuzzySearch = (query, items) => {
    if (!query) return items;
    
    const searchTerm = query.toLowerCase();
    return items.filter(item => {
      const itemLower = item.toLowerCase();
      let queryIndex = 0;
      
      for (let i = 0; i < itemLower.length && queryIndex < searchTerm.length; i++) {
        if (itemLower[i] === searchTerm[queryIndex]) {
          queryIndex++;
        }
      }
      
      return queryIndex === searchTerm.length;
    });
  };

  // Get filtered hospitals for modal
  const getFilteredHospitals = () => {
    return fuzzySearch(modalSearchTerm, hospitals);
  };

  // Scroll to hospital chart area
  const scrollToHospital = (hospitalName) => {
    // Scroll to the main chart area
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Handle hospital selection from modal
  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setModalSearchTerm('');
    setSelectedIndex(0);
    setShowHospitalModal(false);
    scrollToHospital(hospital);
  };

  // Focus modal input when modal opens
  useEffect(() => {
    if (showHospitalModal && modalInputRef.current) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 100);
    }
  }, [showHospitalModal]);

  // Handle keyboard navigation in modal
  const handleModalKeyDown = (e) => {
    const filteredHospitals = getFilteredHospitals();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredHospitals.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredHospitals.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredHospitals[selectedIndex]) {
          handleHospitalSelect(filteredHospitals[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowHospitalModal(false);
        setModalSearchTerm('');
        setSelectedIndex(0);
        break;
      default:
        break;
    }
  };

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
      
    } catch (error) {
      console.error('Error fetching data:', error);
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
            type: 'General Acute Care',
            beds: 312,
            rating: 4.2
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

  // Define handleExportPDF with useCallback to avoid dependency issues
  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    
    try {
      const element = chartRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: darkMode ? '#1e293b' : '#ffffff'
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
  }, [selectedHospital, darkMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setSelectedMetrics([]);
  }, [selectedHospital]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'e':
            event.preventDefault();
            handleExportPDF();
            break;
          case 'c':
            event.preventDefault();
            setViewMode('chart');
            break;
          case 't':
            event.preventDefault();
            setViewMode('table');
            break;
          case 'i':
            event.preventDefault();
            setShowInsights(!showInsights);
            break;
          case 'm':
            event.preventDefault();
            setDarkMode(!darkMode);
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleExportPDF, showInsights, darkMode, setDarkMode]);

  // Helper function to truncate to 1 decimal place
  const truncateToDecimal = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  const getMetricData = () => {
    if (!selectedHospital || !hospitalData[selectedHospital]) return [];
    
    const metrics = hospitalData[selectedHospital].metrics;
    return selectedMetrics.map(metric => {
      const data = metrics[metric];
      return {
        name: metric,
        hospital: truncateToDecimal(data.hospital),
        state: truncateToDecimal(data.state),
        national: truncateToDecimal(data.national),
        vsState: truncateToDecimal(data.vsState),
        vsNational: truncateToDecimal(data.vsNational)
      };
    });
  };

  // Generate sample trend data for sparklines
  const generateTrendData = (currentValue) => {
    const data = [];
    const variance = 5; // Max variance from current value
    for (let i = 0; i < 12; i++) {
      const randomVariance = (Math.random() - 0.5) * 2 * variance;
      const value = currentValue + randomVariance - (variance * 0.5) + (i * variance * 0.05);
      data.push(Math.max(0, Math.min(100, value)));
    }
    data.push(currentValue); // End with current value
    return data;
  };

  const generateInsights = () => {
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
        message: `${bestMetric.name} exceeds national average by ${truncateToDecimal(bestMetric.vsNational)}%`,
        color: 'green'
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
        message: `${worstMetric.name} is ${Math.abs(truncateToDecimal(worstMetric.vsState))}% below state average`,
        color: 'orange'
      });
    }
    
    // Overall performance summary
    const aboveAverageCount = Object.values(metrics).filter(m => m.vsNational > 0).length;
    const totalMetrics = Object.keys(metrics).length;
    
    insights.push({
      type: 'info',
      icon: Award,
      title: 'Performance Summary',
      message: `${aboveAverageCount} out of ${totalMetrics} metrics exceed national average`,
      color: 'blue'
    });
    
    return insights;
  };

  const handleExportEmail = () => {
    // Email export functionality
    console.log('Email export clicked');
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-executive-200 rounded-xl p-4 shadow-executive-lg dark:bg-executive-800/95 dark:border-executive-700 z-tooltip">
          <p className="font-semibold text-executive-900 dark:text-white mb-2">{label}</p>
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

  const InsightCard = ({ insight, delay = 0 }) => {
    const Icon = insight.icon;
    return (
      <MagneticCard 
        className={`insight-card border-l-4 border-${insight.color}-500 animate-in fade-in slide-in-from-top-1`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 bg-gradient-to-br from-${insight.color}-500 to-${insight.color}-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-executive-900 dark:text-white mb-1 truncate">{insight.title}</h4>
            <p className="text-sm text-executive-600 dark:text-executive-300 leading-relaxed">{insight.message}</p>
          </div>
        </div>
      </MagneticCard>
    );
  };

  // Hospital Selection Modal Component
  const HospitalSelectionModal = () => {
    const filteredHospitals = getFilteredHospitals();
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setShowHospitalModal(false)}
        />
        
        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-executive-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-executive-200 dark:border-executive-700">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-executive-900 dark:text-white">
                  Select Hospital
                </h3>
              </div>
              <button
                onClick={() => setShowHospitalModal(false)}
                className="p-2 rounded-lg hover:bg-executive-100 dark:hover:bg-executive-700 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-executive-500 dark:text-executive-400" />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="p-6 border-b border-executive-200 dark:border-executive-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-executive-400" />
                <input
                  ref={modalInputRef}
                  type="text"
                  placeholder="Search hospitals..."
                  value={modalSearchTerm}
                  onChange={(e) => {
                    setModalSearchTerm(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleModalKeyDown}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-executive-200 bg-executive-50 dark:bg-executive-700 dark:border-executive-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-all duration-300"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Hospital List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredHospitals.length === 0 ? (
                <div className="p-6 text-center">
                  <Building2 className="w-12 h-12 text-executive-400 mx-auto mb-3" />
                  <p className="text-executive-600 dark:text-executive-400">
                    {modalSearchTerm ? 'No hospitals found' : 'No hospitals available'}
                  </p>
                </div>
              ) : (
                filteredHospitals.map((hospital, index) => (
                  <button
                    key={hospital}
                    onClick={() => handleHospitalSelect(hospital)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-left transition-all duration-200 ${
                      index === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-r-2 border-indigo-500'
                        : 'hover:bg-executive-50 dark:hover:bg-executive-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-executive-500 dark:text-executive-400" />
                      <span className="font-medium text-executive-900 dark:text-white">
                        {hospital}
                      </span>
                    </div>
                    {selectedHospital === hospital && (
                      <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-executive-200 dark:border-executive-700 bg-executive-50 dark:bg-executive-700/50 rounded-b-2xl">
              <div className="flex items-center justify-between text-sm text-executive-600 dark:text-executive-400">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>{filteredHospitals.length} hospitals</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gradient-to-br from-executive-50 to-indigo-50 dark:from-executive-900 dark:to-executive-800`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-executive-900 dark:text-white mb-2">Loading CareMetrics Pro</h2>
            <p className="text-executive-600 dark:text-executive-300">Preparing your analytics dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getMetricData();
  const insights = generateInsights();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gradient-to-br from-executive-50 to-indigo-100 dark:from-executive-900 dark:to-executive-800`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-executive-200 dark:bg-executive-800/80 dark:border-executive-700 sticky top-0 z-50">
        <div className="container-max py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBackToLanding}
                className="p-2 rounded-xl bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 text-executive-700 dark:text-executive-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-executive-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-executive-900 dark:text-white">CareMetrics Pro</h1>
              </div>
              <button
                onClick={() => setShowHospitalModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-md"
              >
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{selectedHospital || 'Select Hospital'}</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDashboardMode(dashboardMode === 'summary' ? 'expanded' : 'summary')}
                className="p-3 rounded-xl bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 transition-all duration-300"
                title={dashboardMode === 'summary' ? 'Expand Dashboard' : 'Summary View'}
              >
                {dashboardMode === 'summary' ? <Expand className="w-5 h-5 text-executive-700 dark:text-executive-300" /> : <Minimize className="w-5 h-5 text-executive-700 dark:text-executive-300" />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 transition-all duration-300"
              >
                {darkMode ? <Sun className="w-5 h-5 text-executive-700 dark:text-executive-300" /> : <Moon className="w-5 h-5 text-executive-700 dark:text-executive-300" />}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 rounded-xl bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 transition-all duration-300"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5 text-executive-700 dark:text-executive-300" /> : <Maximize2 className="w-5 h-5 text-executive-700 dark:text-executive-300" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard - 2 Column Layout */}
      <div className="container-max py-8">
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
          
          {/* Left Column (65%): Metrics + Chart/Table */}
          <div className="col-span-8 space-y-6">
            {/* Hospital Title and View Controls */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-executive-900 dark:text-white truncate">
                {selectedHospital} Performance
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'chart'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'text-executive-600 hover:bg-executive-100 dark:text-executive-300 dark:hover:bg-executive-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Chart</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'table'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'text-executive-600 hover:bg-executive-100 dark:text-executive-300 dark:hover:bg-executive-700'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* Metric Filter Chips - Robust Horizontal Scrollable Container */}
            <div className="executive-card p-4">
              <div className="relative">
                {/* Scroll Container */}
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
                      className={`min-w-max whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 active:scale-95
                        ${selectedMetrics.includes(metric)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg animate-in fade-in scale-105'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:shadow-md dark:bg-executive-800 dark:text-executive-300 dark:border-executive-600 dark:hover:bg-executive-700'}
                      `}
                    >
                      {/* Rotating icons for visual variety */}
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
                
                {/* Optional: Scroll Indicators */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-white to-transparent dark:from-executive-800 dark:to-transparent pointer-events-none rounded-l-lg" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-l from-white to-transparent dark:from-executive-800 dark:to-transparent pointer-events-none rounded-r-lg" />
              </div>
            </div>

            {/* KPI Grid - True 2x3 Responsive Grid */}
            {selectedMetrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {selectedMetrics.slice(0, 6).map((metric, index) => {
                  const metricKey = metric.trim();
                  const data = hospitalData[selectedHospital]?.metrics[metricKey];
                  if (!data) return null;
                  const isPositive = data.vsNational >= 0;
                  const deltaValue = Math.abs(data.vsNational);
                  return (
                    <div 
                      key={metric} 
                      className="relative min-w-0 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                    >
                      {/* Top left: Metric name */}
                      <div className="text-sm text-slate-500 mb-2 truncate">
                        {metric}
                      </div>
                      {/* Center: Value */}
                      <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {data.hospital.toFixed(1)}%
                      </div>
                      {/* Bottom: Delta indicator */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`flex items-center space-x-1 ${
                          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {isPositive ? '+' : '-'}{deltaValue.toFixed(1)}%
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          vs national
                        </span>
                      </div>
                      {/* Subtle glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Debug Info Section */}
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <div><b>selectedMetrics:</b> {JSON.stringify(selectedMetrics)}</div>
              <div><b>available metrics:</b> {JSON.stringify(Object.keys(hospitalData[selectedHospital]?.metrics || {}))}</div>
              <div><b>chartData:</b> {JSON.stringify(chartData)}</div>
            </div>

            {/* Chart/Table Container with debug and fallback */}
            <div className="chart-container h-full" style={{ minHeight: 320, height: 320 }}>
              {console.log('chartData', chartData)}
              {selectedMetrics.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-executive-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-executive-700 dark:text-executive-300 mb-2">Select Metrics</h3>
                    <p className="text-executive-600 dark:text-executive-400">Choose metrics from the filter above to view performance data</p>
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">No data available for selected metrics</h3>
                  </div>
                </div>
              ) : viewMode === 'chart' ? (
                <div ref={chartRef} style={{ minHeight: 320, height: 320 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#64748b' }}
                        axisLine={{ stroke: darkMode ? '#475569' : '#e2e8f0' }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        allowDataOverflow={false}
                        tick={{ fontSize: 12, fill: darkMode ? '#cbd5e1' : '#64748b' }}
                        axisLine={{ stroke: darkMode ? '#475569' : '#e2e8f0' }}
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
                      <tr className="border-b border-executive-200 dark:border-executive-700">
                        <th className="text-left py-3 px-4 font-semibold text-executive-900 dark:text-white">Metric</th>
                        <th className="text-right py-3 px-4 font-semibold text-executive-900 dark:text-white">Hospital</th>
                        <th className="text-right py-3 px-4 font-semibold text-executive-900 dark:text-white">State</th>
                        <th className="text-right py-3 px-4 font-semibold text-executive-900 dark:text-white">National</th>
                        <th className="text-right py-3 px-4 font-semibold text-executive-900 dark:text-white">vs State</th>
                        <th className="text-right py-3 px-4 font-semibold text-executive-900 dark:text-white">vs National</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row, index) => (
                        <tr key={index} className="border-b border-executive-100 dark:border-executive-800 hover:bg-executive-50 dark:hover:bg-executive-800/50 transition-colors duration-200">
                          <td className="py-3 px-4 text-executive-700 dark:text-executive-300 truncate max-w-xs">{row.name}</td>
                          <td className="py-3 px-4 text-right font-semibold text-executive-900 dark:text-white">
                            <MetricWithSparkline 
                              metric={row.hospital} 
                              data={generateTrendData(parseFloat(row.hospital))} 
                            />
                          </td>
                          <td className="py-3 px-4 text-right text-executive-600 dark:text-executive-400">
                            <AnimatedMetric value={row.state} />
                          </td>
                          <td className="py-3 px-4 text-right text-executive-600 dark:text-executive-400">
                            <AnimatedMetric value={row.national} />
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${
                            parseFloat(row.vsState) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <AnimatedMetric value={Math.abs(row.vsState)} prefix={parseFloat(row.vsState) >= 0 ? '+' : '-'} />
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${
                            parseFloat(row.vsNational) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <AnimatedMetric value={Math.abs(row.vsNational)} prefix={parseFloat(row.vsNational) >= 0 ? '+' : '-'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (35%): Sticky Insights Panel */}
          <div className="col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Export Actions */}
              <MagneticCard className="executive-card p-4">
                <h3 className="text-lg font-semibold text-executive-900 dark:text-white mb-4">Export & Share</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                  <button
                    onClick={handleExportEmail}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 text-executive-700 dark:text-executive-300 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Report</span>
                  </button>
                </div>
              </MagneticCard>

              {/* Report Generator */}
              <MagneticCard className="executive-card p-4">
                <h3 className="text-lg font-semibold text-executive-900 dark:text-white mb-4">Report Generator</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 transition-all duration-300">
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 text-executive-700 dark:text-executive-300 transition-all duration-300">
                    <Settings className="w-4 h-4" />
                    <span>Report Settings</span>
                  </button>
                </div>
              </MagneticCard>

              {/* Insights Panel */}
              <MagneticCard className="executive-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-executive-900 dark:text-white">Insights</h3>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="p-2 rounded-lg bg-executive-100 hover:bg-executive-200 dark:bg-executive-700 dark:hover:bg-executive-600 transition-all duration-300"
                  >
                    {showInsights ? <Minimize2 className="w-4 h-4 text-executive-700 dark:text-executive-300" /> : <Maximize2 className="w-4 h-4 text-executive-700 dark:text-executive-300" />}
                  </button>
                </div>

                {showInsights && (
                  <div className="space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-executive-100 dark:bg-executive-700 rounded-lg p-1">
                      {['overview', 'performance', 'trends'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setInsightTab(tab)}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                            insightTab === tab
                              ? 'bg-white text-executive-900 shadow-executive dark:bg-executive-600 dark:text-white'
                              : 'text-executive-600 hover:text-executive-900 dark:text-executive-300 dark:hover:text-white'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Insights Content */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {insights.map((insight, index) => (
                        <InsightCard key={index} insight={insight} delay={index * 100} />
                      ))}
                    </div>
                  </div>
                )}
              </MagneticCard>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Gradients for Charts */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="stateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="nationalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hospital Selection Modal */}
      {showHospitalModal && <HospitalSelectionModal />}
    </div>
  );
};

export default ModernDashboard; 