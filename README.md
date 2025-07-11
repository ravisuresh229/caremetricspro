# Hospital HCAHPS Benchmarking Tool

An executive-level healthcare analytics platform for benchmarking hospital HCAHPS (Hospital Consumer Assessment of Healthcare Providers and Systems) performance against state and national averages.

## 🚀 Features

### Core Functionality
- **Real-time Data**: Access to 3,891+ hospitals with live HCAHPS data
- **Advanced Search**: Intelligent hospital search with autocomplete
- **Multi-view Analytics**: Chart and table views for different perspectives
- **Metric Selection**: Choose from 8 key HCAHPS metrics
- **Performance Comparison**: Compare against state and national benchmarks

### Executive-Level Enhancements

#### 📊 Smart Insights & Recommendations
- **AI-Powered Analysis**: Automatic generation of performance insights
- **Actionable Recommendations**: Specific improvement suggestions
- **Performance Alerts**: Highlight areas needing attention
- **Executive Summary**: Key performance indicators at a glance

#### 🎨 Visual Enhancements
- **Dark/Light Mode**: Toggle between themes for different environments
- **Glassmorphism Effects**: Modern UI with backdrop blur effects
- **Animated Loading States**: Professional loading animations
- **Responsive Design**: Mobile-first approach with tablet/desktop optimization
- **Micro-interactions**: Smooth transitions and hover effects

#### 📤 Export & Sharing
- **PDF Export**: Professional reports with charts and insights
- **Email Sharing**: Direct email integration for report distribution
- **Branded Templates**: Executive-ready formatting
- **Keyboard Shortcuts**: Power user shortcuts (Ctrl+E for export, Ctrl+C for chart view, etc.)

#### 🎯 UX Improvements
- **Metric Presets**: Quick selection of related metrics
- **Guided Tour**: Interactive onboarding for new users
- **Tooltips**: Detailed explanations for all metrics
- **Performance Indicators**: Visual scoring and trend indicators
- **Error Handling**: Graceful fallbacks and user-friendly error messages

#### 📱 Mobile Optimization
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-friendly**: Mobile-optimized interactions
- **Progressive Web App**: Installable on mobile devices

## 🛠 Technical Architecture

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Recharts**: Professional data visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **HTML2Canvas + jsPDF**: PDF export functionality

### Backend
- **FastAPI**: High-performance Python web framework
- **Pandas**: Data processing and analysis
- **Requests**: HTTP client for data fetching
- **Uvicorn**: ASGI server for production deployment

### Data Sources
- **Cloud Storage**: S3/Dropbox integration for real-time data
- **HCAHPS Data**: Official CMS HCAHPS survey results
- **Hospital Information**: Comprehensive hospital metadata

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd benchmarktool
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Start the backend server**
   ```bash
   cd backend
   python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
   ```

5. **Start the frontend development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Available Metrics

The dashboard tracks 8 key HCAHPS metrics:

1. **Nurse Communication** - How well nurses communicated with patients
2. **Doctor Communication** - How well doctors communicated with patients
3. **Staff Responsiveness** - How responsive hospital staff were to patient needs
4. **Care Transition** - How well patients were prepared for discharge
5. **Discharge Info** - Whether patients received written discharge instructions
6. **Care Cleanliness** - How clean and quiet the hospital environment was
7. **Quietness** - How quiet the hospital environment was at night
8. **Recommend** - Whether patients would recommend the hospital

## 🎯 Usage Guide

### Getting Started
1. **Select a Hospital**: Use the search bar or dropdown to find a hospital
2. **Choose Metrics**: Select the HCAHPS metrics you want to analyze
3. **View Results**: Switch between chart and table views
4. **Export Reports**: Generate PDF reports or share via email

### Keyboard Shortcuts
- `Ctrl+E`: Export PDF report
- `Ctrl+C`: Switch to chart view
- `Ctrl+T`: Switch to table view
- `Ctrl+I`: Toggle insights panel
- `Ctrl+M`: Toggle dark mode

### Metric Presets
- **Communication**: Nurse and Doctor Communication
- **Patient Experience**: Staff Responsiveness, Cleanliness, Quietness
- **Care Quality**: Care Transition, Discharge Info, Recommend
- **All Metrics**: Complete HCAHPS analysis

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

### Backend Deployment (Heroku/AWS)

1. **Create requirements.txt**
   ```bash
   cd backend
   pip freeze > requirements.txt
   ```

2. **Create Procfile for Heroku**
   ```
   web: uvicorn app:app --host 0.0.0.0 --port $PORT
   ```

3. **Deploy to Heroku**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Data source URLs
HCAHPS_URL=https://your-s3-bucket.s3.amazonaws.com/HCAHPS.csv
HOSPITALS_URL=https://your-s3-bucket.s3.amazonaws.com/Hospital_General_Information.csv

# API configuration
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

## 🔧 Configuration

### Customizing Metrics
Edit the `METRIC_IDS` mapping in `backend/app.py` to add or modify metrics:

```python
METRIC_IDS = {
    'H_COMP_1_A_P': 'Nurse Communication',
    'H_COMP_2_A_P': 'Doctor Communication',
    # Add more metrics here
}
```

### Styling Customization
Modify `src/index.css` to customize the visual appearance:

```css
/* Custom color scheme */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --accent-color: #8b5cf6;
}
```

## 📈 Performance Optimization

### Frontend
- **Code Splitting**: Automatic bundle optimization
- **Lazy Loading**: Components loaded on demand
- **Caching**: Browser caching for static assets
- **Image Optimization**: Compressed and optimized images

### Backend
- **Data Caching**: Redis integration for performance
- **Database Optimization**: Efficient queries and indexing
- **CDN Integration**: Global content delivery
- **Load Balancing**: Horizontal scaling support

## 🔒 Security Features

- **CORS Protection**: Cross-origin request security
- **Input Validation**: Sanitized user inputs
- **Error Handling**: Secure error messages
- **HTTPS Enforcement**: Secure data transmission

## 📊 Analytics & Monitoring

### Built-in Analytics
- **User Engagement**: Track dashboard usage
- **Performance Metrics**: Monitor load times
- **Error Tracking**: Automatic error reporting
- **Export Analytics**: Track report generation

### Integration Options
- **Google Analytics**: Web analytics integration
- **Sentry**: Error monitoring and performance tracking
- **LogRocket**: Session replay and debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@hospitalbenchmark.com
- 📖 Documentation: [docs.hospitalbenchmark.com](https://docs.hospitalbenchmark.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🏥 Healthcare Compliance

This tool is designed for healthcare analytics and benchmarking purposes. Please ensure compliance with:
- **HIPAA**: Patient data privacy requirements
- **HCAHPS**: Official CMS survey guidelines
- **State Regulations**: Local healthcare reporting requirements

---

**Built with ❤️ for healthcare professionals**

