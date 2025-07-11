# 🚀 Deployment Guide - CareMetrics Pro

## Architecture Overview
- **Frontend**: React app (deployed on Vercel)
- **Backend**: FastAPI Python app (deployed on Railway)
- **Data**: Hospital metrics from AWS S3

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 1.2 Deploy Backend
1. In Railway dashboard, click "Deploy from GitHub repo"
2. Select your `caremetricspro` repository
3. Set the **Root Directory** to `backend`
4. Railway will automatically detect it's a Python app
5. Deploy!

### 1.3 Get Backend URL
1. After deployment, Railway will give you a URL like:
   `https://your-app-name.railway.app`
2. Copy this URL - you'll need it for the frontend

## Step 2: Deploy Frontend to Vercel

### 2.1 Update API URL
1. In your repository, update `vercel.json`:
   - Replace `your-railway-backend-url.railway.app` with your actual Railway URL

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically detect it's a React app
4. Deploy!

### 2.3 Environment Variables (Optional)
In Vercel dashboard, add environment variable:
- `REACT_APP_API_URL`: Your Railway backend URL

## Step 3: Test Your Deployment

### 3.1 Test Backend
Visit your Railway URL + `/docs` to see the FastAPI docs:
```
https://your-app-name.railway.app/docs
```

### 3.2 Test Frontend
Visit your Vercel URL to see your React app:
```
https://your-app-name.vercel.app
```

## Troubleshooting

### Backend Issues
- Check Railway logs in the dashboard
- Ensure `requirements.txt` has all dependencies
- Verify the Procfile is correct

### Frontend Issues
- Check if API calls are reaching the backend
- Verify CORS is enabled (already configured in app.py)
- Check browser console for errors

### CORS Issues
The backend already has CORS configured to allow all origins (`"*"`), so this should work fine.

## Alternative Deployment Options

### Backend Alternatives
- **Render**: Similar to Railway, good free tier
- **Heroku**: More established, but requires credit card
- **DigitalOcean App Platform**: Good performance

### Frontend Alternatives
- **Netlify**: Great for React apps
- **GitHub Pages**: Free but limited
- **Firebase Hosting**: Google's solution

## Cost Estimation
- **Railway**: Free tier includes 500 hours/month
- **Vercel**: Free tier includes 100GB bandwidth/month
- **Total**: $0/month for basic usage!

## Monitoring
- Railway provides logs and metrics
- Vercel provides analytics and performance insights
- Both platforms offer easy rollbacks if needed 