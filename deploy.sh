#!/bin/bash

# Hospital HCAHPS Benchmarking Tool - Deployment Script
# This script helps deploy both frontend and backend

set -e

echo "🏥 Hospital HCAHPS Benchmarking Tool - Deployment Script"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
    
    print_success "All dependencies are installed!"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    # Install dependencies
    npm install
    
    # Build for production
    npm run build
    
    print_success "Frontend built successfully!"
}

# Deploy frontend to Vercel
deploy_frontend_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
}

# Deploy frontend to Netlify
deploy_frontend_netlify() {
    print_status "Deploying frontend to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    netlify deploy --prod --dir=build
    
    print_success "Frontend deployed to Netlify!"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    cd ..
    
    print_success "Backend setup completed!"
}

# Deploy backend to Heroku
deploy_backend_heroku() {
    print_status "Deploying backend to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not found. Please install Heroku CLI first."
        exit 1
    fi
    
    cd backend
    
    # Check if Heroku app exists
    if ! heroku apps:info &> /dev/null; then
        print_status "Creating new Heroku app..."
        heroku create
    fi
    
    # Deploy to Heroku
    git add .
    git commit -m "Deploy backend to Heroku"
    git push heroku main
    
    cd ..
    
    print_success "Backend deployed to Heroku!"
}

# Run locally
run_local() {
    print_status "Starting local development environment..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    source venv/bin/activate
    python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    print_status "Starting frontend development server..."
    npm start &
    FRONTEND_PID=$!
    
    print_success "Local development environment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:8001"
    print_status "Press Ctrl+C to stop all servers"
    
    # Wait for user to stop
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Check dependencies"
    echo "2) Build frontend"
    echo "3) Deploy frontend to Vercel"
    echo "4) Deploy frontend to Netlify"
    echo "5) Setup backend"
    echo "6) Deploy backend to Heroku"
    echo "7) Run locally"
    echo "8) Full deployment (Frontend + Backend)"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice (1-9): " choice
}

# Full deployment
full_deployment() {
    print_status "Starting full deployment..."
    
    check_dependencies
    build_frontend
    setup_backend
    deploy_frontend_vercel
    deploy_backend_heroku
    
    print_success "Full deployment completed!"
    print_status "Your application is now live!"
}

# Main script
main() {
    while true; do
        show_menu
        
        case $choice in
            1)
                check_dependencies
                ;;
            2)
                build_frontend
                ;;
            3)
                build_frontend
                deploy_frontend_vercel
                ;;
            4)
                build_frontend
                deploy_frontend_netlify
                ;;
            5)
                setup_backend
                ;;
            6)
                setup_backend
                deploy_backend_heroku
                ;;
            7)
                setup_backend
                run_local
                ;;
            8)
                full_deployment
                ;;
            9)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main 