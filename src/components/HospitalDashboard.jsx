import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, Award, Target, Calendar, Download, Filter, Search, Bell, Settings, ChevronDown, ArrowUpRight, ArrowDownRight, Activity, Heart, Star, Shield, Building, MapPin, Bed, X, Plus, Eye, BarChart3, Table2, FileText, Globe, Database, RefreshCw, HelpCircle } from 'lucide-react';

const HospitalDashboard = () => {
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalData, setHospitalData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

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
      if (!event.target.closest('.search-container')) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredHospitals = hospitals.filter(hospital => 
    hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentHospitalData = hospitalData[selectedHospital];

  const getMetricData = () => {
    if (!currentHospitalData) return [];
    return selectedMetrics.map(metric => {
      // Get the metric data object from the current hospital
      const metricData = currentHospitalData.metrics[metric];
      return {
        measure: metric.replace(' ', '\n'),
        Hospital: metricData && metricData.hospital !== undefined ? metricData.hospital : 0,
        'State Avg': metricData && metricData.state !== undefined ? metricData.state : 75,
        'National Avg': metricData && metricData.national !== undefined ? metricData.national : 70
      };
    });
  };

  const getPerformanceColor = (hospital, benchmark) => {
    const diff = hospital - benchmark;
    if (diff >= 5) return 'text-green-600 bg-green-50';
    if (diff >= 0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceIcon = (hospital, benchmark) => {
    const diff = hospital - benchmark;
    if (diff >= 0) return <ArrowUpRight className="w-4 h-4" />;
    return <ArrowDownRight className="w-4 h-4" />;
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color === 'blue' ? 'from-blue-500 to-blue-600' : 
          color === 'green' ? 'from-green-500 to-green-600' : 
          color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  // Tooltip component
  const Tooltip = ({ text }) => (
    <span className="relative group">
      <HelpCircle className="w-4 h-4 ml-1 text-gray-400 cursor-pointer inline-block align-middle" />
      <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none shadow-lg whitespace-normal">
        {text}
      </span>
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Healthcare Analytics</h2>
          <p className="text-gray-600 mb-4">Fetching HCAHPS data from secure cloud storage...</p>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Globe className="w-4 h-4" />
              <span>Connecting to data source</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    CareMetrics Pro
                  </h1>
                  <p className="text-sm text-gray-600">Advanced Healthcare Analytics Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
                <Database className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{hospitals.length} Hospitals</span>
              </div>
              <button 
                onClick={loadData} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hospital Selection */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Hospital</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Hospitals</label>
                <div className="relative search-container">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type to search hospitals..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={() => setShowAutocomplete(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {/* Autocomplete dropdown */}
                  {showAutocomplete && searchTerm && filteredHospitals.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredHospitals.slice(0, 10).map(hospital => (
                        <button
                          key={hospital}
                          onClick={() => {
                            setSearchTerm(hospital);
                            setSelectedHospital(hospital);
                            setShowAutocomplete(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{hospital}</div>
                        </button>
                      ))}
                      {filteredHospitals.length > 10 && (
                        <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100">
                          Showing first 10 of {filteredHospitals.length} results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Selection</label>
                <select 
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentHospitalData.info.name || selectedHospital}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      {currentHospitalData.info.state && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{currentHospitalData.info.state}</span>
                        </div>
                      )}
                      {currentHospitalData.info.type && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>{currentHospitalData.info.type}</span>
                        </div>
                      )}
                      {currentHospitalData.info.beds && (
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4" />
                          <span>{currentHospitalData.info.beds} beds</span>
                        </div>
                      )}
                      {currentHospitalData.info.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{currentHospitalData.info.rating.toFixed(1)}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('chart')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        Chart View
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Table2 className="w-4 h-4" />
                        Table View
                      </button>
                    </div>
                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <MetricCard 
                  title={<span>Overall Performance <Tooltip text="The average of all HCAHPS metric scores for this hospital." /></span>}
                  value={`${Math.round(Object.values(currentHospitalData.metrics).reduce((acc, m) => acc + m.hospital, 0) / Object.keys(currentHospitalData.metrics).length)}%`}
                  change={5.2}
                  icon={Award}
                  color="blue"
                />
                <MetricCard 
                  title={<span>vs State Average <Tooltip text="How much higher or lower this hospital scores, on average, compared to other hospitals in the same state." /></span>}
                  value={`${Math.round(Object.values(currentHospitalData.metrics).reduce((acc, m) => acc + m.vsState, 0) / Object.keys(currentHospitalData.metrics).length * 10) / 10}`}
                  change={2.1}
                  icon={TrendingUp}
                  color="green"
                />
                <MetricCard 
                  title={<span>vs National Average <Tooltip text="How much higher or lower this hospital scores, on average, compared to the national average." /></span>}
                  value={`${Math.round(Object.values(currentHospitalData.metrics).reduce((acc, m) => acc + m.vsNational, 0) / Object.keys(currentHospitalData.metrics).length * 10) / 10}`}
                  change={1.8}
                  icon={Target}
                  color="purple"
                />
                <MetricCard 
                  title={<span>Metrics Above National <Tooltip text="The number of HCAHPS metrics where this hospital scores above the national average." /></span>}
                  value={`${Object.values(currentHospitalData.metrics).filter(m => m.hospital > m.national).length}/${Object.keys(currentHospitalData.metrics).length}`}
                  change={12.5}
                  icon={Star}
                  color="orange"
                />
              </div>
            </div>

            {/* Metric Selection */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metrics to Display</h3>
                <div className="flex flex-wrap gap-2">
                  {allMetrics.map(metric => (
                    <button
                      key={metric}
                      onClick={() => {
                        if (selectedMetrics.includes(metric)) {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                        } else {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedMetrics.includes(metric)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {selectedMetrics.includes(metric) ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {metric}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'chart' ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">HCAHPS Benchmark Comparison</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMetricData()} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="measure" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        label={{ value: "HCAHPS Measures", position: "bottom", offset: 60, style: { fontSize: 14, fontWeight: 'bold' } }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        label={{ value: "Performance Score (%)", angle: -90, position: "left", offset: 0, style: { fontSize: 14, fontWeight: 'bold' } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="Hospital" fill="#3b82f6" name="Your Hospital" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="State Avg" fill="#10b981" name="State Average" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="National Avg" fill="#6b7280" name="National Average" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Bar Chart Legend */}
                <div className="flex gap-6 justify-center mt-4">
                  <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-blue-500"></span> <span className="text-gray-700 text-sm">Your Hospital</span></div>
                  <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-green-500"></span> <span className="text-gray-700 text-sm">State Average</span></div>
                  <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-gray-500"></span> <span className="text-gray-700 text-sm">National Average</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Comparison Table</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Measure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Your Hospital</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">State Avg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National Avg</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getMetricData().map((data, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.measure}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold">{data.Hospital !== undefined && data.Hospital !== null ? data.Hospital : 'No data'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{data['State Avg'] !== undefined && data['State Avg'] !== null ? data['State Avg'] : 'No data'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data['National Avg'] !== undefined && data['National Avg'] !== null ? data['National Avg'] : 'No data'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard; 