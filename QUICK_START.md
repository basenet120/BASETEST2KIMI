# BASE NYC - Quick Start Guide

## 🎯 What's Been Implemented

✅ **Hero Sections**: Image + Video support with modal playback
✅ **Webflow CMS**: All content manageable (production, amenities, features)
✅ **Assembly Forms**: Contact, login, membership with analytics
✅ **SEO Optimization**: Meta tags, schema.org, keywords
✅ **Performance**: Optimized animations, lazy loading, caching

---

## 🚀 Get Started in 3 Steps

### Step 1: Environment Setup (5 minutes)
```bash
# Your API keys are already configured!
# Just need to add Webflow Site ID and Collection IDs

# Edit .env file:
VITE_WEBFLOW_SITE_ID=your_site_id_here

# Get Site ID from Webflow:
# 1. Log into Webflow
# 2. Go to Site Settings
# 3. Copy Site ID
```

### Step 2: Create Webflow Collections (30 minutes)
```bash
# Follow the detailed guide:
cat WEBFLOW_SETUP_GUIDE.md

# Create 10 collections:
1. Hero Content
2. Production Services
3. Studio Amenities
4. Connect Features
5. Blog Posts
6. Portfolio
7. Drone Portfolio
8. Leaders
9. Tour Slides
10. Client Logos

# Add Collection IDs to .env after creating each one
```

### Step 3: Run Your Site (1 minute)
```bash
# Install dependencies
npm install

# Development mode (with sample data)
npm run dev

# Production mode (after Webflow setup)
# Set VITE_USE_SAMPLE_DATA=false in .env
npm run build
npm run preview
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `WEBFLOW_SETUP_GUIDE.md` | Complete Webflow CMS setup instructions |
| `ASSEMBLY_INTEGRATION_GUIDE.md` | Assembly.com form tracking details |
| `IMPLEMENTATION_SUMMARY.md` | Full feature documentation |
| `QUICK_START.md` | This file - quick reference |

---

## ✨ Key Features

### 1. Video-Enabled Hero Sections

**How it works:**
- Add hero image to CMS
- Add optional video URL
- Play button automatically appears
- Clicking opens video in modal

**Example:**
```javascript
// In Webflow CMS Hero Content:
{
  page: "home",
  heroImage: "background.jpg",
  videoUrl: "hero-video.mp4", // Optional
  title: "Your Title"
}
```

### 2. Production Page - CMS Managed

**Webflow Collection:** Production Services

**Structure:**
```
category: "PRE-PRODUCTION" | "PRODUCTION SUPPORT" | "POST-PRODUCTION" | "FABRICATION"
name: "Service Name"
description: "Detailed description"
order: 1
```

**Result:** Accordion with expandable service details

### 3. Studio Page - CMS Managed

**Webflow Collection:** Studio Amenities

**Structure:**
```
name: "Amenity name"
order: 1
```

**Result:** Grid of checkmarked amenities

### 4. Connect Page - CMS Managed

**Webflow Collection:** Connect Features

**Structure:**
```
plan-type: "coworking" | "private-office"
feature-name: "Feature description"
order: 1
```

**Result:** Two pricing cards with feature lists

---

## 🎨 Content Management

### Adding a Blog Post
1. Go to Webflow CMS
2. Open "Blog Posts" collection
3. Click "Add New"
4. Fill in: title, category, date, thumbnail, content
5. Publish
6. Appears automatically on website

### Adding Portfolio Item
1. Open "Portfolio" or "Drone Portfolio" collection
2. Add: title, category, client, thumbnail, video URL
3. Publish
4. Shows in portfolio grid with filtering

### Updating Team Member
1. Open "Leaders" collection
2. Edit: name, title, bio, photo
3. Publish
4. Updates About page automatically

---

## 🔑 API Keys Reference

### Webflow
```env
# Already configured:
VITE_WEBFLOW_API_TOKEN=ws-e5d76ea441e8b580200931f243de0762f968e5e1894b4acce8a0607db85a0646

# You need to add:
VITE_WEBFLOW_SITE_ID=[Get from Webflow]
```

### Assembly.com
```env
# Already configured:
VITE_ASSEMBLY_API_KEY=2e27d1415f654f65b9340fd2335f5d77.cb61fde863de156f
```

### Supabase (if needed)
```env
# Already configured:
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=[key provided]
```

---

## 🧪 Testing Your Setup

### Test Hero Videos
1. Navigate to home page
2. Look for play button on hero
3. Click play button
4. Video should open in modal
5. Close modal with X button

### Test CMS Content
1. Create a test blog post in Webflow
2. Publish Webflow site
3. Reload your website
4. Blog post should appear in "The Dailies"

### Test Forms
1. Fill out contact form
2. Submit
3. Check browser Network tab for Assembly requests
4. Log into Assembly dashboard
5. Verify submission appears

### Test SEO
1. View page source (Ctrl+U)
2. Look for meta tags in `<head>`
3. Find Schema.org structured data
4. Verify title and description are correct

---

## 🐛 Troubleshooting

### CMS Content Not Loading
```bash
# Check Collection IDs
cat .env | grep COLLECTION

# Enable sample data temporarily
# In .env: VITE_USE_SAMPLE_DATA=true

# Check browser console for errors
# Open DevTools → Console tab
```

### Forms Not Working
```bash
# Verify Assembly script loaded
# In browser console type: window.assembly

# Check Network tab for failed requests
# DevTools → Network → Filter: assembly

# Verify API key in .env
cat .env | grep VITE_ASSEMBLY
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist

# Try building again
npm run build
```

---

## 📊 Analytics & Insights

### Assembly Dashboard
**URL:** https://assembly.com/login

**What You'll See:**
- Form submission rate
- Field completion rates
- Drop-off points
- Time to complete
- User flow analysis

**Forms Tracked:**
- Contact form (base-nyc-contact)
- Login form (base-nyc-login)
- Membership form (base-nyc-membership)

### SEO Performance
**Track With:**
- Google Search Console
- Google Analytics
- Ahrefs / SEMrush

**Optimized Keywords:**
- NYC studio rental
- Production services NYC
- Coworking space NYC
- Video production NYC
- Creative workspace Chinatown

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm run preview
```

### Deploy to Hosting
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod

# Manual
# Upload /dist folder to your hosting
```

### Post-Deployment Checklist
- [ ] All images loading correctly
- [ ] Webflow CMS content displaying
- [ ] Forms submitting to Assembly
- [ ] Videos playing in modals
- [ ] Mobile responsive working
- [ ] SEO meta tags present
- [ ] Analytics tracking working

---

## 📞 Need Help?

### Documentation
1. `WEBFLOW_SETUP_GUIDE.md` - CMS setup
2. `ASSEMBLY_INTEGRATION_GUIDE.md` - Form tracking
3. `IMPLEMENTATION_SUMMARY.md` - Complete features

### Check These First
1. Browser console for errors
2. Network tab for failed requests
3. `.env` file for correct API keys
4. Webflow site is published
5. Collection IDs are correct

### Still Stuck?
- Webflow: https://university.webflow.com/
- Assembly: https://assembly.com/docs
- React: https://react.dev/learn

---

## ✅ Launch Checklist

### Before Launch
- [ ] All Webflow collections created
- [ ] Collection IDs in `.env`
- [ ] Content added to all collections
- [ ] Webflow site published
- [ ] `VITE_USE_SAMPLE_DATA=false`
- [ ] Build succeeds: `npm run build`
- [ ] All forms tested
- [ ] Assembly tracking verified
- [ ] Mobile tested
- [ ] SEO tags verified

### After Launch
- [ ] Submit sitemap to Google
- [ ] Set up Google Analytics
- [ ] Monitor Assembly dashboard
- [ ] Test all forms live
- [ ] Verify CMS updates work
- [ ] Check mobile performance
- [ ] Monitor page speed

---

## 🎉 You're Ready!

Your BASE NYC website has:

✅ **Full CMS Control**: Manage all content in Webflow
✅ **Advanced Analytics**: Track forms with Assembly
✅ **SEO Optimized**: Rank for NYC production keywords
✅ **Video Heroes**: Engaging video content
✅ **Performance**: Fast, optimized, responsive

**Next Step:** Follow `WEBFLOW_SETUP_GUIDE.md` to create your CMS collections!

---

**Happy Building! 🚀**
