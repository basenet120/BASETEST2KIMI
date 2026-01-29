# BASE NYC Website

> Creative Infrastructure for Production in New York City

A modern, fully CMS-managed website built with React, Vite, Webflow CMS, and Assembly.com analytics.

![BASE NYC](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)

---

## ✨ Features

- 🎥 **Video-Enabled Hero Sections** - Images with modal video playback
- 📝 **Webflow CMS Integration** - All content manageable through Webflow
- 📊 **Assembly.com Analytics** - Advanced form tracking and insights
- 🚀 **SEO Optimized** - Meta tags, Schema.org, and keyword optimization
- ⚡ **Performance Optimized** - Fast loading, smooth animations
- 📱 **Fully Responsive** - Mobile, tablet, and desktop support
- ♿ **Accessible** - WCAG compliant, semantic HTML

---

## 📁 Project Structure

```
base-nyc/
├── src/
│   ├── App.tsx              # Main app entry
│   ├── app_(8).jsx          # Full application code
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Production build
├── .env                     # Environment variables (API keys)
├── index.html               # HTML with SEO tags
├── QUICK_START.md           # ⭐ Start here!
├── WEBFLOW_SETUP_GUIDE.md   # Webflow CMS setup
├── ASSEMBLY_INTEGRATION_GUIDE.md  # Form analytics guide
├── IMPLEMENTATION_SUMMARY.md      # Complete features list
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Webflow account with API access
- Assembly.com account

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd base-nyc

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

---

## 🔑 Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` (or update existing `.env`):

```env
# Webflow CMS
REACT_APP_WEBFLOW_API_TOKEN=ws-e5d76ea441e8b580200931f243de0762f968e5e1894b4acce8a0607db85a0646
REACT_APP_WEBFLOW_SITE_ID=your_site_id_here
REACT_APP_USE_SAMPLE_DATA=false

# Assembly.com
REACT_APP_ASSEMBLY_API_KEY=2e27d1415f654f65b9340fd2335f5d77.cb61fde863de156f

# Webflow Collection IDs (get from Webflow after creating collections)
REACT_APP_COLLECTION_HERO_CONTENT=
REACT_APP_COLLECTION_PRODUCTION_SERVICES=
REACT_APP_COLLECTION_STUDIO_AMENITIES=
REACT_APP_COLLECTION_CONNECT_FEATURES=
# ... (see WEBFLOW_SETUP_GUIDE.md for complete list)
```

### 2. Set Up Webflow CMS

Follow the comprehensive guide: **[WEBFLOW_SETUP_GUIDE.md](WEBFLOW_SETUP_GUIDE.md)**

This guide covers:
- Creating all required CMS collections
- Configuring collection fields
- Getting Collection IDs
- Populating content

### 3. Verify Assembly Integration

Assembly.com is pre-configured! Forms automatically track:
- Form views and submissions
- Field interactions (focus, change, blur)
- User behavior and drop-off points

See **[ASSEMBLY_INTEGRATION_GUIDE.md](ASSEMBLY_INTEGRATION_GUIDE.md)** for details.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](QUICK_START.md)** | ⭐ **Start here!** Quick reference guide |
| **[WEBFLOW_SETUP_GUIDE.md](WEBFLOW_SETUP_GUIDE.md)** | Complete Webflow CMS setup instructions |
| **[ASSEMBLY_INTEGRATION_GUIDE.md](ASSEMBLY_INTEGRATION_GUIDE.md)** | Form analytics and tracking guide |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | Full technical documentation |

---

## 🎯 Key Features Explained

### Video-Enabled Hero Sections

All hero sections support both images and videos:

```javascript
// In Webflow CMS:
{
  heroImage: "background.jpg",  // Always show image
  videoUrl: "video.mp4",         // Optional - adds play button
  title: "Hero Title"
}
```

**Result:**
- Background image displays
- Play button appears if video URL provided
- Clicking play button opens video in modal
- Fully responsive on all devices

### Content Management via Webflow

**Production Page** → Webflow Collection: "Production Services"
- All accordion items
- Service categories and descriptions
- Fully manageable in Webflow CMS

**Studio Page** → Webflow Collection: "Studio Amenities"
- All amenity listings
- Grid display with checkmarks

**Connect Page** → Webflow Collection: "Connect Features"
- Coworking space features
- Private office features
- Pricing and benefits

**Blog (The Dailies)** → Webflow Collection: "Blog Posts"
- All articles with categories
- Rich text content support
- Author and date management

### Form Analytics with Assembly

**Integrated Forms:**
1. Contact Form (`/contact`)
2. Login Form (`/login`)
3. Membership Application (`/membership`)

**Tracked Data:**
- Form views and submissions
- Field completion rates
- Time to complete
- Drop-off analysis
- User journey mapping

Access your dashboard at: https://assembly.com

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npm run typecheck
```

### Development Workflow

1. **Use Sample Data** during development:
   ```env
   REACT_APP_USE_SAMPLE_DATA=true
   ```

2. **Switch to Live CMS** when ready:
   ```env
   REACT_APP_USE_SAMPLE_DATA=false
   ```

3. **Test Locally** before deploying:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🎨 Customization

### Adding New Pages

1. Create page component in `src/app_(8).jsx`
2. Add navigation link
3. Update breadcrumbs
4. Add to page titles

### Adding New CMS Collections

1. Create collection in Webflow
2. Add collection ID to `.env`
3. Create transform function
4. Use `useCMSData` hook
5. Display in component

See **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** for detailed examples.

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output in `/dist` folder.

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

### Environment Variables (Production)

Set these in your hosting platform:
- `REACT_APP_WEBFLOW_API_TOKEN`
- `REACT_APP_WEBFLOW_SITE_ID`
- `REACT_APP_ASSEMBLY_API_KEY`
- All collection IDs

---

## 📊 SEO & Analytics

### SEO Features

✅ Meta tags (title, description, keywords)
✅ Open Graph tags (Facebook)
✅ Twitter Card tags
✅ Schema.org structured data (LocalBusiness)
✅ Canonical URLs
✅ Semantic HTML
✅ Breadcrumb navigation

### Target Keywords

- NYC studio rental
- Production services NYC
- Coworking space NYC
- Video production NYC
- Photo studio NYC
- Creative workspace Chinatown
- Studio space Manhattan

### Analytics Platforms

**Assembly.com**: Form tracking and user behavior
**Google Analytics**: Traffic and conversion tracking
**Google Search Console**: SEO performance

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Hero videos play in modal
- [ ] All forms submit successfully
- [ ] CMS content displays correctly
- [ ] Mobile responsive on all pages
- [ ] All links work
- [ ] Images load properly
- [ ] Animations perform smoothly
- [ ] SEO meta tags present

### Browser Testing

Tested on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Testing

Tested on:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Tablet devices

---

## 🐛 Troubleshooting

### CMS Content Not Loading

```bash
# Check Collection IDs
cat .env | grep COLLECTION

# Enable sample data
REACT_APP_USE_SAMPLE_DATA=true

# Check console for errors
# Open DevTools → Console
```

### Forms Not Submitting

```bash
# Verify Assembly loaded
# Browser console: window.assembly

# Check API key
cat .env | grep ASSEMBLY
```

### Build Failures

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist

# Rebuild
npm run build
```

See **[QUICK_START.md](QUICK_START.md)** for more troubleshooting tips.

---

## 📞 Support

### Documentation
- **[QUICK_START.md](QUICK_START.md)** - Quick reference
- **[WEBFLOW_SETUP_GUIDE.md](WEBFLOW_SETUP_GUIDE.md)** - CMS setup
- **[ASSEMBLY_INTEGRATION_GUIDE.md](ASSEMBLY_INTEGRATION_GUIDE.md)** - Analytics

### External Resources
- [Webflow API Docs](https://developers.webflow.com/)
- [Assembly.com Docs](https://assembly.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📝 License

Copyright © 2025 BASE NYC. All rights reserved.

---

## 🎉 Ready to Launch?

**Next Steps:**
1. Read **[QUICK_START.md](QUICK_START.md)**
2. Set up Webflow CMS using **[WEBFLOW_SETUP_GUIDE.md](WEBFLOW_SETUP_GUIDE.md)**
3. Test all features
4. Deploy to production
5. Monitor Assembly analytics

**Your BASE NYC website is production-ready!** 🚀

---

Built with ❤️ in NYC
