import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  TrendingUp, 
  Award, 
  Target, 
  Brain, 
  ArrowRight, 
  Sun, 
  Moon, 
  Sparkles, 
  Play, 
  BarChart, 
  Shield, 
  AlertTriangle 
} from 'lucide-react';

const LandingPage = ({ onEnterDashboard, darkMode, setDarkMode }) => {
  const [activeTab, setActiveTab] = useState('why-us');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mini Dashboard Card Component
  const MiniDashboardCard = () => (
    <div className="executive-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-executive-900 dark:text-white">Live Performance</h3>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      {/* Mini Chart */}
      <div className="mb-6">
        <div className="flex items-end space-x-1 h-20 mb-4">
          {[60, 75, 85, 70, 90, 80, 95].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-sm animate-pulse-slow"
              style={{ 
                height: `${height}%`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* KPI Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-executive-600 dark:text-executive-300">Nurse Communication</span>
          <div className="flex items-center space-x-2">
            <span className="kpi-value">85.2%</span>
            <ArrowRight className="w-4 h-4 text-green-500" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-executive-600 dark:text-executive-300">Patient Satisfaction</span>
          <div className="flex items-center space-x-2">
            <span className="kpi-value">89.1%</span>
            <ArrowRight className="w-4 h-4 text-green-500" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-executive-600 dark:text-executive-300">Response Time</span>
          <div className="flex items-center space-x-2">
            <span className="kpi-value">72.8%</span>
            <ArrowRight className="w-4 h-4 text-red-500" />
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-executive-200 dark:border-executive-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-executive-600 dark:text-executive-300">3,891+ Hospitals</span>
          <span className="text-executive-600 dark:text-executive-300">Live Data</span>
        </div>
      </div>
    </div>
  );

  // Tab Content Components
  const TabContent = () => {
    switch (activeTab) {
      case 'why-us':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-executive-900 dark:text-white">Why Choose CareMetrics Pro</h3>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  title: "Real-time Analytics",
                  description: "Live HCAHPS data from 3,891+ hospitals with instant updates"
                },
                {
                  icon: Brain,
                  title: "AI-Powered Insights",
                  description: "Intelligent recommendations for healthcare leaders"
                },
                {
                  icon: Target,
                  title: "Executive Focus",
                  description: "Board-ready reports and presentations"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description: "HIPAA-compliant with enterprise-grade security"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-executive-200 dark:bg-executive-800/50 dark:border-executive-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-executive-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-executive-600 dark:text-executive-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'ai-insights':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-executive-900 dark:text-white">AI Insights Engine</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 dark:from-executive-800 dark:to-executive-900 dark:border-executive-700">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-executive-900 dark:text-white">Performance Alert</span>
                </div>
                <p className="text-sm text-executive-600 dark:text-executive-300">
                  Nurse Communication exceeds national average by 3.9% - excellent performance indicator
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 dark:from-executive-800 dark:to-executive-900 dark:border-executive-700">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-executive-900 dark:text-white">Attention Needed</span>
                </div>
                <p className="text-sm text-executive-600 dark:text-executive-300">
                  Staff Responsiveness 5.4% below state average - recommend immediate action plan
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 dark:from-executive-800 dark:to-executive-900 dark:border-executive-700">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-executive-900 dark:text-white">Trend Analysis</span>
                </div>
                <p className="text-sm text-executive-600 dark:text-executive-300">
                  6 out of 8 metrics performing above national average - strong overall performance
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'benchmarking':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-executive-900 dark:text-white">Advanced Benchmarking</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-executive-200 dark:bg-executive-800/50 dark:border-executive-700">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">50+</div>
                  <div className="text-sm text-executive-600 dark:text-executive-300">States</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-executive-200 dark:bg-executive-800/50 dark:border-executive-700">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">8</div>
                  <div className="text-sm text-executive-600 dark:text-executive-300">HCAHPS Metrics</div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-executive-200 dark:bg-executive-800/50 dark:border-executive-700">
                <h4 className="font-semibold text-executive-900 dark:text-white mb-3">Benchmark Comparison</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-executive-600 dark:text-executive-300">vs State Average</span>
                    <span className="text-sm font-medium text-green-600">+2.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-executive-600 dark:text-executive-300">vs National Average</span>
                    <span className="text-sm font-medium text-green-600">+3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-executive-600 dark:text-executive-300">Peer Ranking</span>
                    <span className="text-sm font-medium text-indigo-600">Top 15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen animated-background ${darkMode ? 'dark' : ''}`}>
      {/* Animated Background Elements */}
      <div className="grid-pattern animate-grid-move"></div>
      <div className="motion-line top-1/4 w-full animate-motion-line"></div>
      <div className="motion-line top-3/4 w-full animate-motion-line" style={{ animationDelay: '2s' }}></div>
      <div className="blur-spot w-96 h-96 top-1/4 left-1/4 animate-blur-spot"></div>
      <div className="blur-spot w-64 h-64 bottom-1/4 right-1/4 animate-blur-spot" style={{ animationDelay: '3s' }}></div>

      {/* Header */}
      <header className="relative z-10">
        <div className="container-max py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-executive-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-executive-900 dark:text-white">CareMetrics Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-executive-200 shadow-executive hover:shadow-executive-lg dark:bg-executive-800/80 dark:border-executive-700 transition-all duration-300"
              >
                {darkMode ? <Sun className="w-5 h-5 text-executive-700 dark:text-executive-300" /> : <Moon className="w-5 h-5 text-executive-700 dark:text-executive-300" />}
              </button>
              <button
                onClick={onEnterDashboard}
                className="btn btn-primary px-6 py-3 text-lg font-semibold shadow-executive-lg hover:shadow-executive-xl transition-all duration-300"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Screen 3-Column Layout */}
      <main className="container-max h-[calc(100vh-120px)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full h-full">
          
          {/* Column 1: Hero Text and CTA */}
          <div className={`lg:col-span-1 flex flex-col justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8 dark:bg-indigo-900/20 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span>Executive Healthcare Analytics Platform</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-executive-900 mb-6 leading-tight dark:text-white">
              Transform
              <span className="text-gradient-primary block">Healthcare</span>
              <span className="text-executive-600 dark:text-executive-300">Analytics</span>
            </h1>
            
            <p className="text-lg text-executive-600 mb-8 leading-relaxed dark:text-executive-300">
              CareMetrics Pro delivers executive-level insights into hospital HCAHPS performance, 
              enabling data-driven decisions that improve patient care quality.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onEnterDashboard}
                className="btn btn-primary px-8 py-4 text-lg font-semibold shadow-executive-lg hover:shadow-executive-xl transition-all duration-300"
              >
                Start Analyzing
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="btn btn-secondary px-8 py-4 text-lg font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">3,891+</div>
                <div className="text-sm text-executive-600 dark:text-executive-300">Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">8</div>
                <div className="text-sm text-executive-600 dark:text-executive-300">Metrics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">99.9%</div>
                <div className="text-sm text-executive-600 dark:text-executive-300">Uptime</div>
              </div>
            </div>
          </div>

          {/* Column 2: Animated Dashboard Card */}
          <div className={`lg:col-span-1 flex items-center justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <MiniDashboardCard />
          </div>

          {/* Column 3: Tabbed Content */}
          <div className={`lg:col-span-1 flex flex-col transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="executive-card p-6 h-full">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-executive-100 dark:bg-executive-700 rounded-lg p-1 mb-6">
                {[
                  { id: 'why-us', label: 'Why Us', icon: Award },
                  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
                  { id: 'benchmarking', label: 'Benchmarking', icon: Target }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-executive-900 shadow-executive dark:bg-executive-600 dark:text-white'
                        : 'text-executive-600 hover:text-executive-900 dark:text-executive-300 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                <TabContent />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage; 