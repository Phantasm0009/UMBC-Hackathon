# DisasterLens - DigitalOcean Deployment Guide

## 🚀 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

**Pros**: Easy deployment, automatic scaling, built-in CI/CD
**Cost**: ~$5-12/month

#### Steps:

1. **Push to GitHub**
   - Make sure your code is pushed to GitHub
   - Repository: UMBC-Hackathon

2. **Create App Platform App**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect your GitHub repo: `UMBC-Hackathon`
   - Select branch: `main`

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment: Node.js

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=https://bshbiqwzltzhjldzfqot.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
   GEMINI_API_KEY=your_gemini_key_here
   NEXT_PUBLIC_APP_URL=https://your-app-name.ondigitalocean.app
   ```

5. **Deploy**
   - Review settings and deploy
   - Your app will be available at: `https://your-app-name.ondigitalocean.app`

---

### Option 2: DigitalOcean Droplet

**Pros**: More control, potentially cheaper for high traffic
**Cost**: ~$4-6/month + setup time

#### Steps:

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - Basic plan: $4-6/month
   - Enable monitoring and backups

2. **SSH into Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   
   # Install Nginx for reverse proxy
   apt install -y nginx
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/Phantasm0009/UMBC-Hackathon.git
   cd UMBC-Hackathon
   
   # Install dependencies
   npm ci --only=production
   
   # Create environment file
   cp .env.production.example .env.production
   # Edit .env.production with your actual values
   nano .env.production
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "disasterlens" -- start
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   ```bash
   # Create Nginx config
   nano /etc/nginx/sites-available/disasterlens
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/disasterlens /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

6. **Setup SSL (Optional but Recommended)**
   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx
   
   # Get SSL certificate
   certbot --nginx -d your_domain.com
   ```

---

## 🔧 Environment Variables

Make sure to set these in your deployment:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `NEXT_PUBLIC_APP_URL`: Your deployed app URL

## 📊 Performance Tips

1. **Enable gzip compression** in Nginx
2. **Set up CDN** using DigitalOcean Spaces
3. **Configure caching** headers
4. **Monitor with PM2** (for Droplet deployment)
5. **Setup database connection pooling** if needed

## 🚨 Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify real-time functionality works
- [ ] Test admin panel login
- [ ] Check citizen reporting works
- [ ] Verify map displays correctly
- [ ] Test AI classification system
- [ ] Confirm all API endpoints respond
- [ ] Check SSE connections work
- [ ] Verify Supabase connection
- [ ] Test on mobile devices