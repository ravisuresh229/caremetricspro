import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Target, Download, Search, Heart, Star, Building, MapPin, Bed, X, Plus, BarChart3, Table2, Globe, Database, RefreshCw, Info, Mail, AlertTriangle, CheckCircle, Lightbulb, Sparkles, Zap, Target as TargetIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Premium color palette
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  accent: {
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  }
};

const EnhancedHospitalDashboard = () => {
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalData, setHospitalData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chartRef = useRef(null);
  const [exportError, setExportError] = useState("");
  const [autocompletePos, setAutocompletePos] = useState({ top: 0, left: 0, width: 0 });

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

  const metricPresets = {
    'Communication': ['Nurse Communication', 'Doctor Communication'],
    'Patient Experience': ['Staff Responsiveness', 'Care Cleanliness', 'Quietness'],
    'Care Quality': ['Care Transition', 'Discharge Info', 'Recommend'],
    'All Metrics': allMetrics
  };

  // Load data from backend API with premium loading experience
  const loadData = useCallback(async () => {
    setDataLoading(true);
    
    try {
      // Fetch hospitals list
      const hospitalsResponse = await fetch('/api/hospitals');
      const hospitalsData = await hospitalsResponse.json();
      setHospitals(hospitalsData.hospitals || []);
      
      // Fetch all hospitals data
      const allDataResponse = await fetch('/api/all-hospitals-data');
      const allData = await allDataResponse.json();
      setHospitalData(allData);
      
      // Set first hospital as default
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
      setDataLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Reset metrics when hospital changes
    setSelectedMetrics([]);
  }, [selectedHospital]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on search container or autocomplete dropdown
      const isSearchContainer = event.target.closest('.search-container');
      const isAutocompleteDropdown = event.target.closest('[data-autocomplete-dropdown]');
      
      if (!isSearchContainer && !isAutocompleteDropdown) {
        // Small delay to prevent race conditions with button clicks
        setTimeout(() => {
          setShowAutocomplete(false);
        }, 10);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showInsights]);

  // Update autocomplete dropdown position
  const inputRef = useRef(null);
  useEffect(() => {
    if (showAutocomplete && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setAutocompletePos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showAutocomplete, searchTerm]);

  const filteredHospitals = hospitals.filter(hospital => 
    hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentHospitalData = hospitalData[selectedHospital];

  const getMetricData = () => {
    if (!currentHospitalData) return [];
    return selectedMetrics.map(metric => {
      const metricData = currentHospitalData.metrics[metric];
      return {
        measure: metric.replace(' ', '\n'),
        Hospital: metricData && metricData.hospital !== undefined ? metricData.hospital : 0,
        'State Avg': metricData && metricData.state !== undefined ? metricData.state : 75,
        'National Avg': metricData && metricData.national !== undefined ? metricData.national : 70
      };
    });
  };

  // Smart Insights Generation
  const generateInsights = () => {
    if (!currentHospitalData) return [];
    
    const insights = [];
    const metrics = currentHospitalData.metrics;
    
    // Performance analysis
    const aboveNational = Object.values(metrics).filter(m => m.hospital > m.national).length;
    const belowState = Object.values(metrics).filter(m => m.hospital < m.state).length;
    
    if (aboveNational >= 6) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Performance',
        description: `${aboveNational} out of 8 metrics are above national average`,
        action: 'Maintain current practices'
      });
    }
    
    if (belowState >= 4) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Improvement Opportunities',
        description: `${belowState} metrics are below state average`,
        action: 'Focus on staff training and process improvements'
      });
    }
    
    // Find best and worst performing metrics
    const sortedMetrics = Object.entries(metrics).sort((a, b) => b[1].hospital - a[1].hospital);
    const bestMetric = sortedMetrics[0];
    const worstMetric = sortedMetrics[sortedMetrics.length - 1];
    
    if (bestMetric && bestMetric[1].hospital > 85) {
      insights.push({
        type: 'success',
        icon: Star,
        title: 'Outstanding Performance',
        description: `${bestMetric[0]} is your strongest area at ${bestMetric[1].hospital}%`,
        action: 'Share best practices across departments'
      });
    }
    
    if (worstMetric && worstMetric[1].hospital < 70) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Priority Improvement Area',
        description: `${worstMetric[0]} needs attention at ${worstMetric[1].hospital}%`,
        action: 'Develop targeted improvement plan'
      });
    }
    
    return insights;
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    setExporting(true);
    setExportError("");
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${selectedHospital}-HCAHPS-Benchmark-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportError("Export failed. Please try again, or check if your browser allows downloads and there are no cross-origin images.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportEmail = () => {
    const subject = encodeURIComponent(`${selectedHospital} HCAHPS Benchmark Report`);
    const body = encodeURIComponent(`Please find attached the HCAHPS benchmark report for ${selectedHospital}.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Improve MetricCard text clarity and number visibility
  const MetricCard = ({ title, value, change, icon: Icon, color = "blue", subtitle, unit }) => (
    <div className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105`}
      style={{ minHeight: '210px' }}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-16 h-16 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className={`flex items-center gap-2 text-base font-extrabold ${
          change >= 0 ? 'text-emerald-700' : 'text-red-700'
        }`}>
          {change >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className={`text-3xl font-bold mb-3 tracking-tight ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
        style={{ letterSpacing: '-0.01em', fontSize: '2rem', lineHeight: '2.5rem' }}>
        {value}{unit && <span className="text-lg font-semibold ml-1">{unit}</span>}
      </h3>
      <p className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{title}</p>
      {subtitle && <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
    </div>
  );

  // About Modal Component
  const AboutModal = () => {
    if (!showAbout) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-slate-800/95 border-slate-600' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              About CareMetrics Pro
            </h2>
            <button 
              onClick={() => setShowAbout(false)}
              className={`p-3 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-2xl transition-all duration-300`}
            >
              <X className="w-7 h-7" />
            </button>
          </div>
          
          <div className="space-y-10">
            {/* Overview */}
            <div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                Overview
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-lg`}>
                CareMetrics Pro is a comprehensive analytics platform designed to help healthcare administrators, 
                quality improvement teams, and hospital executives understand and improve their Hospital Consumer Assessment of Healthcare 
                Providers and Systems (HCAHPS) performance. This tool provides real-time benchmarking against state and national averages, 
                enabling data-driven decision making for quality improvement initiatives.
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105`}>
                  <h4 className={`font-bold text-lg mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>📊 Real-time Benchmarking</h4>
                  <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} text-sm leading-relaxed`}>Compare your hospital's HCAHPS scores against state and national averages with interactive charts and tables.</p>
                </div>
                <div className={`${darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-green-50 border-green-200'} p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105`}>
                  <h4 className={`font-bold text-lg mb-3 ${darkMode ? 'text-emerald-300' : 'text-green-900'}`}>🎯 Smart Insights</h4>
                  <p className={`${darkMode ? 'text-emerald-200' : 'text-green-800'} text-sm leading-relaxed`}>AI-powered analysis that identifies performance trends and provides actionable recommendations.</p>
                </div>
                <div className={`${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'} p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105`}>
                  <h4 className={`font-bold text-lg mb-3 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>📈 Performance Tracking</h4>
                  <p className={`${darkMode ? 'text-purple-200' : 'text-purple-800'} text-sm leading-relaxed`}>Monitor key performance indicators and track improvements over time across all HCAHPS domains.</p>
                </div>
                <div className={`${darkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'} p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105`}>
                  <h4 className={`font-bold text-lg mb-3 ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>📋 Export & Share</h4>
                  <p className={`${darkMode ? 'text-orange-200' : 'text-orange-800'} text-sm leading-relaxed`}>Generate professional PDF reports and share insights with stakeholders via email.</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Technology Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• React 18.2.0</li>
                    <li>• Tailwind CSS 3.3.0</li>
                    <li>• Recharts 2.8.0</li>
                    <li>• Lucide React Icons</li>
                    <li>• HTML2Canvas & jsPDF</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• FastAPI (Python)</li>
                    <li>• Pandas for Data Processing</li>
                    <li>• Uvicorn ASGI Server</li>
                    <li>• CORS Support</li>
                    <li>• RESTful API Design</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data & Infrastructure</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• HCAHPS Dataset (442K+ records)</li>
                    <li>• Hospital Information (5K+ hospitals)</li>
                    <li>• Cloud Storage Integration</li>
                    <li>• Real-time Data Processing</li>
                    <li>• Secure API Endpoints</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HCAHPS Metrics */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">HCAHPS Metrics Covered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Nurse Communication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Doctor Communication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Staff Responsiveness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Care Transition</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Discharge Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Care Cleanliness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Quietness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Recommend Hospital</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Data Sources</h3>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700 text-sm leading-relaxed">
                  This application utilizes official HCAHPS survey data from the Centers for Medicare & Medicaid Services (CMS), 
                  combined with hospital general information from the American Hospital Directory. The data is processed and 
                  aggregated to provide meaningful benchmarks and insights for quality improvement initiatives.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Support & Contact</h3>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-blue-800 text-sm">
                  For technical support, feature requests, or questions about the data, please contact our development team. 
                  This tool is designed to support healthcare quality improvement efforts and is continuously updated with the latest HCAHPS data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} relative overflow-hidden`}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-lg">
            {/* Premium loading animation */}
            <div className="relative mb-12">
              <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto shadow-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Orbiting elements */}
              <div className="absolute inset-0 animate-spin">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              </div>
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              Loading Healthcare Analytics
            </h2>
            <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Fetching HCAHPS data from secure cloud storage...
            </p>
            
            {/* Glassmorphism status card */}
            <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-slate-800/20' : 'bg-white/20'}`}>
              <div className="flex items-center justify-center gap-3 text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Connecting to secure data source</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-400/5 via-transparent to-blue-400/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <AboutModal />
      
      {/* Premium Header */}
      <header className={`${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border-b sticky top-0 z-50 header shadow-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${darkMode ? 'drop-shadow-lg' : ''}`}>
                    CareMetrics Pro
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                    Advanced Healthcare Analytics Platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Premium stats card */}
              <div className={`flex items-center gap-3 ${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/50 border-gray-200'} backdrop-blur-xl border rounded-2xl px-4 py-3 shadow-lg`}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{hospitals.length}</span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} ml-1`}>Hospitals</span>
                </div>
              </div>
              
              {/* Dark mode toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 ${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-white/50 hover:bg-white/70'} backdrop-blur-xl border ${darkMode ? 'border-slate-600' : 'border-gray-200'} rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg`}
                title="Toggle Theme"
              >
                <Sparkles className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-purple-600'}`} />
              </button>
              
              {/* About button */}
              <button 
                onClick={() => setShowAbout(true)}
                className={`p-3 ${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-white/50 hover:bg-white/70'} backdrop-blur-xl border ${darkMode ? 'border-slate-600' : 'border-gray-200'} rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg`}
                title="About this Application"
              >
                <Info className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Hospital Selection */}
        <div className="mb-12">
          <div className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              Select Hospital
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search Hospitals</label>
                <div className="relative search-container" style={{ position: 'relative', zIndex: 30 }}>
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type to search hospitals..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={() => setShowAutocomplete(true)}
                    className={`w-full pl-12 pr-4 py-4 ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400' : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'} backdrop-blur-xl border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  />
                  {/* Autocomplete dropdown in portal */}
                  {showAutocomplete && searchTerm && filteredHospitals.length > 0 &&
                    ReactDOM.createPortal(
                      <div
                        data-autocomplete-dropdown
                        className={`z-[9999] fixed ${darkMode ? 'bg-slate-800/90 border-slate-600' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border rounded-2xl shadow-2xl max-h-60 overflow-y-auto`}
                        style={{
                          top: autocompletePos.top,
                          left: autocompletePos.left,
                          width: autocompletePos.width,
                        }}
                      >
                        {filteredHospitals.slice(0, 10).map(hospital => (
                          <button
                            key={hospital}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Hospital selected:', hospital);
                              setSearchTerm(hospital);
                              setSelectedHospital(hospital);
                              setShowAutocomplete(false);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100'} last:border-b-0 transition-colors duration-200 cursor-pointer`}
                          >
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{hospital}</div>
                          </button>
                        ))}
                        {filteredHospitals.length > 10 && (
                          <div className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-400 border-slate-700' : 'text-gray-500 border-gray-100'} border-t`}>
                            Showing first 10 of {filteredHospitals.length} results
                          </div>
                        )}
                      </div>,
                      document.body
                    )
                  }
                </div>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hospital Selection</label>
                <select 
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className={`w-full px-4 py-4 ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-white/50 border-gray-200 text-gray-900'} backdrop-blur-xl border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                >
                  {filteredHospitals.map(hospital => (
                    <option key={hospital} value={hospital}>{hospital}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {currentHospitalData && (
          <>
            {/* Hospital Info & KPIs */}
            <div className="mb-12">
              <div className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl mb-8`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                      {currentHospitalData.info.name || selectedHospital}
                    </h2>
                    <div className={`flex flex-wrap items-center gap-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {currentHospitalData.info.state && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{currentHospitalData.info.state}</span>
                        </div>
                      )}
                      {currentHospitalData.info.type && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                            <Building className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{currentHospitalData.info.type}</span>
                        </div>
                      )}
                      {currentHospitalData.info.beds && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Bed className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{currentHospitalData.info.beds} beds</span>
                        </div>
                      )}
                      {currentHospitalData.info.rating && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{currentHospitalData.info.rating.toFixed(1)}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 view-toggle">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewMode('chart')}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                          viewMode === 'chart' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : `${darkMode ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'} backdrop-blur-xl border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`
                        }`}
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-semibold">Chart View</span>
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                          viewMode === 'table' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : `${darkMode ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'} backdrop-blur-xl border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`
                        }`}
                      >
                        <Table2 className="w-5 h-5" />
                        <span className="font-semibold">Table View</span>
                      </button>
                    </div>
                    
                    {/* Export buttons */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-lg"
                        title="Export PDF (Ctrl+E)"
                      >
                        {exporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        <span className="font-semibold">{exporting ? 'Exporting...' : 'Export PDF'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 quick-stats">
                <MetricCard 
                  title="Overall Performance"
                  value={`${Math.round(Object.values(currentHospitalData.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(currentHospitalData.metrics).length)}%`}
                  change={5.2}
                  icon={Award}
                  color="blue"
                  subtitle="Average across all metrics"
                />
                <MetricCard 
                  title="vs State Average"
                  value={`${Math.round(Object.values(currentHospitalData.metrics).reduce((acc, m) => acc + m.vsState, 0) / Object.keys(currentHospitalData.metrics).length * 10) / 10}`}
                  change={2.1}
                  icon={TrendingUp}
                  color="green"
                  subtitle="Performance vs state peers"
                  unit=" pts"
                />
                <MetricCard 
                  title="vs National Average"
                  value={`${Math.round(Object.values(currentHospitalData.metrics).reduce((acc, m) => acc + m.vsNational, 0) / Object.keys(currentHospitalData.metrics).length * 10) / 10}`}
                  change={1.8}
                  icon={Target}
                  color="purple"
                  subtitle="Performance vs national"
                  unit=" pts"
                />
                <MetricCard 
                  title="Metrics Above National"
                  value={`${Object.values(currentHospitalData.metrics).filter(m => m.hospital > m.national).length}/${Object.keys(currentHospitalData.metrics).length}`}
                  change={12.5}
                  icon={Star}
                  color="orange"
                  subtitle="Strong performing areas"
                />
              </div>
            </div>

            {/* Smart Insights */}
            {showInsights && (
              <div className="mb-12">
                <div className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent`}>
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      Smart Insights & Recommendations
                    </h3>
                    <button 
                      onClick={() => setShowInsights(false)}
                      className={`p-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} hover:bg-gray-100 rounded-xl transition-all duration-300`}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generateInsights().map((insight, index) => (
                      <div key={index} className={`p-6 rounded-2xl border-l-4 backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                        insight.type === 'success' 
                          ? `${darkMode ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50'}` :
                        insight.type === 'warning' 
                          ? `${darkMode ? 'border-yellow-500 bg-yellow-500/10' : 'border-yellow-500 bg-yellow-50'}` :
                          `${darkMode ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'}`
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            insight.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                            insight.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                            'bg-gradient-to-r from-red-500 to-pink-600'
                          }`}>
                            <insight.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{insight.title}</h4>
                            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{insight.description}</p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{insight.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metric Selection with Presets */}
            <div className="mb-12 metric-selection">
              <div className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                    Select Metrics to Display
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Presets:</span>
                    {Object.keys(metricPresets).map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSelectedMetrics(metricPresets[preset]);
                          setSelectedPreset(preset);
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                          selectedPreset === preset 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : `${darkMode ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'} backdrop-blur-xl border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allMetrics.map(metric => (
                    <button
                      key={metric}
                      onClick={() => {
                        if (selectedMetrics.includes(metric)) {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                        } else {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        }
                        setSelectedPreset('');
                      }}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                        selectedMetrics.includes(metric)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : `${darkMode ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'} backdrop-blur-xl border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`
                      }`}
                    >
                      {selectedMetrics.includes(metric) ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {metric}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'chart' ? (
              <div ref={chartRef} className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl`}>
                <h3 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  HCAHPS Benchmark Comparison
                </h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMetricData()} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#f1f5f9"} />
                      <XAxis 
                        dataKey="measure" 
                        tick={{ fontSize: 12, fill: darkMode ? "#e2e8f0" : "#374151" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        label={{ 
                          value: "HCAHPS Measures", 
                          position: "bottom", 
                          offset: 60, 
                          style: { 
                            fontSize: 16, 
                            fontWeight: 'bold',
                            fill: darkMode ? "#e2e8f0" : "#374151"
                          } 
                        }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: darkMode ? "#e2e8f0" : "#374151" }}
                        label={{ 
                          value: "Performance Score (%)", 
                          angle: -90, 
                          position: "left", 
                          offset: 0, 
                          style: { 
                            fontSize: 16, 
                            fontWeight: 'bold',
                            fill: darkMode ? "#e2e8f0" : "#374151"
                          } 
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#1e293b' : 'white', 
                          border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          color: darkMode ? '#e2e8f0' : '#374151'
                        }}
                      />
                      <Bar dataKey="Hospital" fill="#3b82f6" name="Your Hospital" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="State Avg" fill="#10b981" name="State Average" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="National Avg" fill="#6b7280" name="National Average" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Bar Chart Legend */}
                <div className="flex gap-8 justify-center mt-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-5 h-5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"></span> 
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Hospital</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-5 h-5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 shadow-md"></span> 
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>State Average</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-5 h-5 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 shadow-md"></span> 
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>National Average</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl`}>
                <h3 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  Detailed Comparison Table
                </h3>
                <div className={`overflow-x-auto rounded-2xl border ${darkMode ? 'border-slate-600 bg-slate-800/30' : 'border-gray-200 bg-white/50'} backdrop-blur-xl`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-8 py-4 text-left text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Measure</th>
                        <th className={`px-8 py-4 text-left text-sm font-bold text-blue-500 uppercase tracking-wider`}>Your Hospital</th>
                        <th className={`px-8 py-4 text-left text-sm font-bold text-emerald-500 uppercase tracking-wider`}>State Avg</th>
                        <th className={`px-8 py-4 text-left text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>National Avg</th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'bg-slate-800/30 divide-slate-700' : 'bg-white/50 divide-gray-200'} divide-y`}>
                      {getMetricData().map((data, idx) => (
                        <tr key={idx} className={`${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                          <td className={`px-8 py-6 whitespace-nowrap text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.measure}</td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-blue-700 font-bold">{data.Hospital !== undefined && data.Hospital !== null ? data.Hospital : 'No data'}</td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-emerald-700 font-semibold">{data['State Avg'] !== undefined && data['State Avg'] !== null ? data['State Avg'] : 'No data'}</td>
                          <td className={`px-8 py-6 whitespace-nowrap text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data['National Avg'] !== undefined && data['National Avg'] !== null ? data['National Avg'] : 'No data'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {/* Export error message */}
      {exportError && (
        <div className="mt-4 text-red-600 font-semibold text-center bg-red-50 border border-red-200 rounded-xl p-4">
          {exportError}
        </div>
      )}
    </div>
  );
};

export default EnhancedHospitalDashboard; 