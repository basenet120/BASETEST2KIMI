# Webflow CMS Setup Guide for BASE NYC

This guide will help you set up all the required Webflow CMS collections to make your BASE NYC website fully content-manageable.

## Getting Started

### 1. Get Your Webflow Site ID

1. Log into your Webflow account
2. Go to your BASE NYC site
3. Click on Site Settings
4. Your Site ID will be in the URL or under API settings
5. Update `REACT_APP_WEBFLOW_SITE_ID` in your `.env` file

### 2. Enable Webflow API Access

1. Go to Site Settings → Integrations → API Access
2. Generate an API token if you haven't already (you've been provided: `ws-e5d76ea441e8b580200931f243de0762f968e5e1894b4acce8a0607db85a0646`)
3. This token is already configured in your `.env` file

## Required CMS Collections

Create the following collections in your Webflow CMS. After creating each collection, copy its Collection ID and add it to your `.env` file.

### To Get Collection IDs:
1. In Webflow Designer, go to CMS Collections
2. Click on a collection
3. Look at the URL - the collection ID is the string after `/collections/`
4. Example: `https://webflow.com/design/your-site/collections/ABC123` → Collection ID is `ABC123`

---

## 1. Hero Content Collection

**Collection Name:** `Hero Content`
**Env Variable:** `REACT_APP_COLLECTION_HERO_CONTENT`

### Fields:
- **page** (Plain Text) - Which page this hero appears on (e.g., "home", "about", "studios")
- **tag** (Plain Text) - Small tagline above title
- **title** (Plain Text) - Main hero headline
- **subtitle** (Plain Text) - Hero description
- **button-text** (Plain Text) - CTA button text
- **hero-image** (Image) - Background image for hero
- **hero-video** (Video or Plain Text for URL) - Optional video URL
- **video-thumbnail** (Image) - Thumbnail to show before video plays

### Example Entry:
- page: `home`
- tag: `THE CREATIVE INFRASTRUCTURE COMPANY`
- title: `Stop managing vendors. Start making things.`
- subtitle: `Base is the foundational layer for production in NYC.`
- button-text: `BOOK A TOUR`
- hero-image: [Upload image]
- hero-video: `https://example.com/video.mp4`
- video-thumbnail: [Upload thumbnail]

---

## 2. Production Services Collection

**Collection Name:** `Production Services`
**Env Variable:** `REACT_APP_COLLECTION_PRODUCTION_SERVICES`

### Fields:
- **category** (Plain Text) - Service category (e.g., "PRE-PRODUCTION", "PRODUCTION SUPPORT")
- **name** (Plain Text) - Service name
- **description** (Rich Text or Plain Text) - Detailed service description
- **order** (Number) - Display order within category
- **category-order** (Number) - Order of the category itself

### Example Entries:

**Entry 1:**
- category: `PRE-PRODUCTION`
- name: `Planning & Project Management`
- description: `Production timelines, schedules, budget development, cost modeling, scope definition, feasibility analysis, vendor sourcing, and bid management.`
- order: `1`
- category-order: `1`

**Entry 2:**
- category: `PRE-PRODUCTION`
- name: `Casting & Talent`
- description: `Casting direction, talent scouting, on-camera talent casting, influencer sourcing, voiceover casting, and talent contract negotiations.`
- order: `2`
- category-order: `1`

**Entry 3:**
- category: `PRODUCTION SUPPORT`
- name: `On-Set Production`
- description: `Full-scale production management, line producing, field producing, assistant directors, production assistants, set coordination, and craft services.`
- order: `1`
- category-order: `2`

---

## 3. Studio Amenities Collection

**Collection Name:** `Studio Amenities`
**Env Variable:** `REACT_APP_COLLECTION_STUDIO_AMENITIES`

### Fields:
- **name** (Plain Text) - Amenity name
- **icon** (Plain Text) - Icon identifier (optional)
- **order** (Number) - Display order

### Example Entries:
- name: `Full kitchenette`, order: `1`
- name: `Microwave & oven`, order: `2`
- name: `Air fryer`, order: `3`
- name: `Induction cooktop`, order: `4`
- name: `Dishwasher`, order: `5`
- name: `Full-size fridge`, order: `6`
- name: `Full bathroom`, order: `7`
- name: `Shower`, order: `8`
- name: `2 Gbps internet`, order: `9`
- name: `Video doorbell`, order: `10`
- name: `Elevator access`, order: `11`
- name: `Ketra lighting`, order: `12`

---

## 4. Connect Features Collection

**Collection Name:** `Connect Features`
**Env Variable:** `REACT_APP_COLLECTION_CONNECT_FEATURES`

### Fields:
- **plan-type** (Plain Text) - "coworking" or "private-office"
- **feature-name** (Plain Text) - Feature description
- **order** (Number) - Display order

### Example Entries for Coworking:
- plan-type: `coworking`, feature-name: `Dedicated desk`, order: `1`
- plan-type: `coworking`, feature-name: `High-speed WiFi`, order: `2`
- plan-type: `coworking`, feature-name: `Meeting rooms`, order: `3`
- plan-type: `coworking`, feature-name: `Kitchen & lounge`, order: `4`
- plan-type: `coworking`, feature-name: `Discounted studio rentals`, order: `5`

### Example Entries for Private Office:
- plan-type: `private-office`, feature-name: `Private lockable office`, order: `1`
- plan-type: `private-office`, feature-name: `All coworking benefits`, order: `2`
- plan-type: `private-office`, feature-name: `Priority studio booking`, order: `3`
- plan-type: `private-office`, feature-name: `Client meeting space`, order: `4`
- plan-type: `private-office`, feature-name: `Storage options`, order: `5`

---

## 5. Blog Posts Collection

**Collection Name:** `Blog Posts`
**Env Variable:** `REACT_APP_COLLECTION_BLOG_POSTS`

### Fields:
- **slug** (Plain Text) - URL-friendly identifier
- **category** (Option/Dropdown) - Categories: "INDUSTRY NEWS", "NYC CULTURE & EVENTS", "SPOTLIGHTS"
- **title** (Plain Text) - Article title
- **date** (Date) - Publication date
- **thumbnail** (Image) - Featured image
- **excerpt** (Plain Text) - Short summary
- **content** (Rich Text) - Full article content
- **author** (Plain Text) - Author name

---

## 6. Portfolio Collection

**Collection Name:** `Portfolio`
**Env Variable:** `REACT_APP_COLLECTION_PORTFOLIO`

### Fields:
- **category** (Option/Dropdown) - "COMMERCIAL", "MUSIC VIDEO", "BRANDED", "EDITORIAL"
- **title** (Plain Text) - Project title
- **client** (Plain Text) - Client name
- **thumbnail** (Image) - Project thumbnail
- **video-url** (Plain Text) - Optional video URL
- **description** (Rich Text) - Project description

---

## 7. Drone Portfolio Collection

**Collection Name:** `Drone Portfolio`
**Env Variable:** `REACT_APP_COLLECTION_DRONE_PORTFOLIO`

### Fields:
- **category** (Option/Dropdown) - "COMMERCIAL", "MUSIC VIDEO", "REAL ESTATE", "LIVE EVENT", "FPV"
- **title** (Plain Text) - Project title
- **client** (Plain Text) - Client name
- **thumbnail** (Image) - Project thumbnail
- **video-url** (Plain Text) - Optional video URL
- **description** (Rich Text) - Project description

---

## 8. Leaders Collection

**Collection Name:** `Leaders`
**Env Variable:** `REACT_APP_COLLECTION_LEADERS`

### Fields:
- **name** (Plain Text) - Leader's full name
- **title** (Plain Text) - Job title
- **bio** (Rich Text) - Biography
- **philosophy** (Plain Text) - Personal philosophy/quote
- **photo** (Image) - Headshot
- **order** (Number) - Display order

---

## 9. Tour Slides Collection

**Collection Name:** `Tour Slides`
**Env Variable:** `REACT_APP_COLLECTION_TOUR_SLIDES`

### Fields:
- **title** (Plain Text) - Slide title
- **description** (Plain Text) - Slide description
- **image** (Image) - Tour image
- **order** (Number) - Display order

---

## 10. Client Logos Collection

**Collection Name:** `Client Logos`
**Env Variable:** `REACT_APP_COLLECTION_CLIENT_LOGOS`

### Fields:
- **name** (Plain Text) - Client name
- **logo** (Image) - Logo image
- **url** (Plain Text) - Optional client website URL
- **order** (Number) - Display order

---

## Implementation Steps

### Step 1: Create Collections
1. Log into Webflow
2. Go to CMS Collections
3. Create each collection listed above with the exact fields specified

### Step 2: Add Collection IDs to .env
1. For each collection, get its Collection ID
2. Update your `.env` file with all collection IDs:

```env
REACT_APP_COLLECTION_HERO_CONTENT=your_collection_id_here
REACT_APP_COLLECTION_PRODUCTION_SERVICES=your_collection_id_here
REACT_APP_COLLECTION_STUDIO_AMENITIES=your_collection_id_here
REACT_APP_COLLECTION_CONNECT_FEATURES=your_collection_id_here
REACT_APP_COLLECTION_BLOG_POSTS=your_collection_id_here
REACT_APP_COLLECTION_PORTFOLIO=your_collection_id_here
REACT_APP_COLLECTION_DRONE_PORTFOLIO=your_collection_id_here
REACT_APP_COLLECTION_LEADERS=your_collection_id_here
REACT_APP_COLLECTION_TOUR_SLIDES=your_collection_id_here
REACT_APP_COLLECTION_CLIENT_LOGOS=your_collection_id_here
```

### Step 3: Populate Content
1. Add content to each collection in Webflow CMS
2. Publish your site in Webflow (this makes content available via API)

### Step 4: Enable Live Data
1. In your `.env` file, set: `REACT_APP_USE_SAMPLE_DATA=false`
2. Restart your development server: `npm run dev`

---

## Testing Your Setup

1. After adding collection IDs, restart your app
2. Check the browser console for any API errors
3. Verify that content from Webflow is displaying correctly
4. If you see sample data instead of CMS data, check:
   - Collection IDs are correct
   - API token is valid
   - Content is published in Webflow
   - `REACT_APP_USE_SAMPLE_DATA=false`

---

## Video Support in Hero Sections

When adding hero content with videos:

1. Set the `hero-image` field with a thumbnail/poster image
2. Set the `hero-video` field with the video URL (must be accessible URL)
3. The app will automatically display a play button overlay
4. Clicking the play button opens the video in a modal

### Supported Video Formats:
- MP4 (recommended)
- WebM
- External URLs (YouTube, Vimeo - requires embed URL)

---

## Troubleshooting

### Content Not Appearing
- Verify collection IDs are correct
- Ensure content is published in Webflow
- Check browser console for API errors
- Verify API token has correct permissions

### Images Not Loading
- Ensure images are uploaded in Webflow
- Check that Webflow image URLs are accessible
- Images should be optimized for web (< 2MB)

### API Rate Limits
- Webflow API has rate limits
- During development, enable `REACT_APP_USE_SAMPLE_DATA=true` to avoid hitting limits
- Use sample data for local testing, live data for production

---

## Need Help?

If you encounter issues:
1. Check Webflow API documentation: https://developers.webflow.com/
2. Verify all collection IDs in your `.env` file
3. Ensure your Webflow site is published
4. Check browser console for detailed error messages

---

## Next Steps

After setting up Webflow CMS:

1. **Assembly.com Integration**: Forms are already integrated and tracking user interactions
2. **SEO Optimization**: Meta tags and structured data are configured in `index.html`
3. **Performance**: The app uses React memoization and lazy loading for optimal performance
4. **Deploy**: Build and deploy your site with `npm run build`

Your BASE NYC website is now fully CMS-managed and ready for production!
