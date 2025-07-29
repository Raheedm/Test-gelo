# 🚀 AWS Deployment Guide - Find People Near You

## ✅ Pre-Deployment Checklist

Your app is **PRODUCTION READY** with:
- ✅ User authentication (login/register)
- ✅ MongoDB Atlas cloud database
- ✅ Real-time location tracking
- ✅ Socket.IO for live updates
- ✅ Beautiful UI with circular avatars
- ✅ Mock data seeded in cloud database

## 🏗️ AWS Deployment Options

### Option 1: AWS EC2 (Recommended)

#### Step 1: Launch EC2 Instance
```bash
# 1. Go to AWS Console → EC2
# 2. Launch Instance:
#    - AMI: Ubuntu Server 22.04 LTS
#    - Instance Type: t3.micro (free tier)
#    - Key Pair: Create new or use existing
#    - Security Group: Allow HTTP (80), HTTPS (443), SSH (22), Custom (3000)
```

#### Step 2: Connect and Setup Server
```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### Step 3: Deploy Your App
```bash
# Clone your repository (or upload files)
git clone your-repo-url
cd find-people-app

# Build for production
chmod +x deploy.sh
./deploy.sh

# Move to deployment directory
sudo mkdir -p /var/www/findpeople
sudo cp -r dist/* /var/www/findpeople/
sudo chown -R ubuntu:ubuntu /var/www/findpeople

# Start the application
cd /var/www/findpeople
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/findpeople

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Serve static files
    location / {
        root /var/www/findpeople/public;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
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

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/findpeople /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: AWS Elastic Beanstalk

#### Step 1: Install EB CLI
```bash
pip install awsebcli --upgrade --user
```

#### Step 2: Initialize and Deploy
```bash
# Build your app
./deploy.sh

# Initialize EB application
cd dist
eb init

# Create environment and deploy
eb create production
eb deploy
```

## 🔧 Environment Configuration

### Update Production URLs
Before deployment, update these files:

**frontend/src/app/services/auth.service.ts:**
```typescript
private apiUrl = 'https://your-domain.com/api';  // Update this
```

**frontend/src/app/services/location.service.ts:**
```typescript
private apiUrl = 'https://your-domain.com/api';  // Update this
```

**backend/.env.production:**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://minerbitcoin003:AD2OScP3FIZQLSCH@cluster0.la4l4mq.mongodb.net/findpeople?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secure-production-jwt-secret-change-this
CORS_ORIGIN=https://your-domain.com
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update CORS_ORIGIN to your actual domain
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

## 📊 Monitoring

```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart all
```

## 🧪 Testing Production Deployment

1. **Test Registration:** Create a new user account
2. **Test Login:** Login with existing credentials
3. **Test Location:** Allow location permission
4. **Test Real-time:** Open multiple browser tabs
5. **Test Mobile:** Check responsive design

## 🎯 Post-Deployment

Your app will be live at:
- **Frontend:** `http://your-ec2-ip` or `https://your-domain.com`
- **API:** `http://your-ec2-ip/api` or `https://your-domain.com/api`

### Test Credentials:
- Username: `raheed_muz`
- Password: `password123`

## 🚨 Troubleshooting

**Common Issues:**
1. **CORS errors:** Update CORS_ORIGIN in .env.production
2. **Database connection:** Check MongoDB Atlas IP whitelist
3. **Socket.IO not working:** Verify Nginx WebSocket configuration
4. **Static files not loading:** Check Nginx static file serving

**Useful Commands:**
```bash
# Check server logs
sudo journalctl -u nginx -f
pm2 logs

# Restart services
sudo systemctl restart nginx
pm2 restart all

# Check ports
sudo netstat -tlnp | grep :3000
```

## 🎉 Success!

Your "Find People Near You" app is now live on AWS with:
- ✅ Real-time location tracking
- ✅ User authentication
- ✅ Beautiful UI
- ✅ Cloud database
- ✅ Production-ready deployment

**Next Steps:**
1. Set up a custom domain
2. Enable HTTPS with Let's Encrypt
3. Set up automated backups
4. Configure monitoring alerts