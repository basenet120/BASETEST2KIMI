import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// BASE NYC WEBSITE - With Webflow CMS Integration
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  USE_SAMPLE_DATA: import.meta.env.VITE_USE_SAMPLE_DATA === 'true',

  COLLECTIONS: {
    BLOG_POSTS: import.meta.env.VITE_COLLECTION_BLOG_POSTS,
    CLIENT_LOGOS: import.meta.env.VITE_COLLECTION_CLIENT_LOGOS,
    DRONE_PORTFOLIO: import.meta.env.VITE_COLLECTION_DRONE_PORTFOLIO,
    LEADERS: import.meta.env.VITE_COLLECTION_LEADERS,
    PORTFOLIO: import.meta.env.VITE_COLLECTION_PORTFOLIO,
    TOUR_SLIDES: import.meta.env.VITE_COLLECTION_TOUR_SLIDES,
    PRODUCTION_SERVICES: import.meta.env.VITE_COLLECTION_PRODUCTION_SERVICES,
    STUDIO_AMENITIES: import.meta.env.VITE_COLLECTION_STUDIO_AMENITIES,
    CONNECT_FEATURES: import.meta.env.VITE_COLLECTION_CONNECT_FEATURES,
  },
};

// ============================================
// WEBFLOW CMS SERVICE
// ============================================

const WebflowService = {
  async fetchCollection(collectionId) {
    if (CONFIG.USE_SAMPLE_DATA || !collectionId) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        collectionId,
        live: "1",
        limit: "100",
        offset: "0",
      });

      const response = await fetch(`/api/webflow/items?${params.toString()}`);

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`API error: ${response.status} ${txt}`);
      }

      const data = await response.json();

      // ✅ exactly matches your API response
      return Array.isArray(data.items) ? data.items : null;
    } catch (error) {
      console.error(`Failed to fetch collection ${collectionId}:`, error);
      return null;
    }
  },

  // Transform functions for each collection type
  transformBlogPost(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      slug: fields.slug || item.id,
      category: fields.category || 'INDUSTRY NEWS',
      title: fields.title || '',
      date: fields.date
        ? new Date(fields.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '',
      thumbnail: fields.thumbnail?.url || null,
      excerpt: fields.excerpt || '',
      content: fields.content || '',
      author: fields.author || '',
    };
  },

  transformPortfolioItem(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      category: fields.category || 'COMMERCIAL',
      title: fields.title || '',
      client: fields.client || '',
      thumbnail: fields.thumbnail?.url || null,
      videoUrl: fields['video-url'] || null,
      description: fields.description || '',
    };
  },

  transformLeader(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      name: fields.name || '',
      title: fields.title || '',
      bio: fields.bio || '',
      philosophy: fields.philosophy || '',
      photo: fields.photo?.url || null,
      order: fields.order || 0,
    };
  },

  transformTourSlide(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      title: fields.title || '',
      description: fields.description || '',
      image: fields.image?.url || null,
      order: fields.order || 0,
    };
  },

  transformClientLogo(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      name: fields.name || '',
      logo: fields.logo?.url || null,
      url: fields.url || null,
      order: fields.order || 0,
    };
  },

  transformTestimonial(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      quote: fields.quote || '',
      author: fields.author || '',
      title: fields.title || '',
      company: fields.company || '',
      photo: fields.photo?.url || null,
    };
  },

  transformLegalContent(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      title: fields.title || '',
      content: fields.content || '',
      lastUpdated: fields['last-updated']
        ? new Date(fields['last-updated']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
      order: fields.order || 0,
    };
  },

  transformIndustrySolution(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      industry: fields.industry || '',
      sub: fields.sub || '',
      title: fields.title || '',
      desc: fields.desc || '',
      link: fields.link || '',
      order: fields.order || 0,
    };
  },

  transformHeroContent(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      page: fields.page || '',
      tag: fields.tag || '',
      title: fields.title || '',
      subtitle: fields.subtitle || '',
      buttonText: fields['button-text'] || '',
      buttonLink: fields['button-link'] || '',
      heroImage: fields['hero-image']?.url || null,
    };
  },

  transformPageContent(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      page: fields.page || '',
      section: fields.section || '',
      title: fields.title || '',
      content: fields.content || '',
      order: fields.order || 0,
    };
  },

    transformProductionService(item) {
      const fields = item.fieldData;

      // Map Webflow category IDs to readable names
      const categoryMap = {
        'df4735b4a60a29e3a8775c71f1d053c6': 'PRE-PRODUCTION',
        '60d5212edeac7b5cf401ce7445daac3e': 'PRODUCTION SUPPORT',
        'fd76b57bef03c1cab74fdc1253c10d55': 'POST-PRODUCTION',
        'cd494a6b678588350d94e7614f4e6dd1': 'FABRICATION'
      };

      return {
        id: item.id,
        category: categoryMap[fields.category] || fields.category,
        name: fields.name || '',
        description: fields.description || '',
        order: fields.order || 0,
        categoryOrder: fields['category-order'] || 0,
      };
    },

  transformStudioAmenity(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      name: fields.name || '',
      icon: fields.icon || '',
      order: fields.order || 0,
    };
  },

  transformConnectFeature(item) {
    const fields = item.fieldData;
    return {
      id: item.id,
      planType: fields['plan-type'] || '',
      featureName: fields['feature-name'] || '',
      order: fields.order || 0,
    };
  },
};

// ============================================
// ASSEMBLY.COM FORM SERVICE
// ============================================

const AssemblyService = {
  async submitForm(formData, formType = 'contact') {
    try {
      const response = await fetch(CONFIG.ASSEMBLY_FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.ASSEMBLY_API_KEY}`,
          'X-Assembly-Form-Type': formType,
        },
        body: JSON.stringify({
          ...formData,
          formType,
          submittedAt: new Date().toISOString(),
          source: 'base-nyc-website',
        }),
      });

      if (!response.ok) {
        throw new Error(`Assembly API error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Assembly form submission failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Track form field interactions for Assembly analytics
  trackFieldInteraction(formId, fieldName, action) {
    if (typeof window !== 'undefined' && window.assembly && typeof window.assembly.track === 'function') {
      window.assembly.track('form_field_interaction', {
        formId,
        fieldName,
        action,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Initialize Assembly tracking on form mount
  initFormTracking(formId) {
    if (typeof window !== 'undefined' && window.assembly && typeof window.assembly.track === 'function') {
      window.assembly.track('form_view', {
        formId,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// ============================================
// CUSTOM HOOKS FOR CMS DATA
// ============================================

function useCMSData(collectionId, transformFn, fallbackData) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (CONFIG.USE_SAMPLE_DATA || !collectionId) {
        setData(fallbackData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const items = await WebflowService.fetchCollection(collectionId);
        if (mounted && items) {
          const transformed = items.map(transformFn);
          setData(transformed);
        } else if (mounted) {
          setData(fallbackData);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setData(fallbackData);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [collectionId]);

  return { data, loading, error };
}

// Custom hook for form handling with Assembly integration
function useAssemblyForm(formId, initialState = {}) {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    AssemblyService.initFormTracking(formId);
  }, [formId]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    AssemblyService.trackFieldInteraction(formId, fieldName, 'change');
  }, [formId]);

  const handleFieldFocus = useCallback((fieldName) => {
    AssemblyService.trackFieldInteraction(formId, fieldName, 'focus');
  }, [formId]);

  const handleFieldBlur = useCallback((fieldName) => {
    AssemblyService.trackFieldInteraction(formId, fieldName, 'blur');
  }, [formId]);

  const handleSubmit = useCallback(async (e, formType = 'contact') => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const result = await AssemblyService.submitForm(formData, formType);
    
    setIsSubmitting(false);
    setSubmitStatus(result.success ? 'success' : 'error');

    if (result.success) {
      setFormData(initialState);
    }

    return result;
  }, [formData, initialState]);

  return {
    formData,
    isSubmitting,
    submitStatus,
    handleFieldChange,
    handleFieldFocus,
    handleFieldBlur,
    handleSubmit,
    setFormData,
    setSubmitStatus,
  };
}

// ============================================
// SAMPLE DATA (Fallback)
// ============================================

const SAMPLE_LEADERS = [
  { id: 1, name: 'Alon Sicherman', title: 'Founder & CEO', bio: 'Alon Sicherman founded Base NYC after 15 years in production, working with brands like Nike, Apple, and Netflix.', philosophy: '"The best creative work happens when you remove friction."', photo: null, order: 1 },
  { id: 2, name: 'Eyal Levy', title: 'Co-founder & COO', bio: 'Eyal Levy brings two decades of operational expertise to Base NYC.', philosophy: '"Infrastructure should be invisible."', photo: null, order: 2 }
];

const SAMPLE_TOUR_SLIDES = [
  { id: 1, title: 'Main Studio', description: '2,000 sq ft of open studio space', image: null, order: 1 },
  { id: 2, title: 'Window Light', description: 'South and east facing window walls', image: null, order: 2 },
  { id: 3, title: 'Green Screen', description: '30-foot corner chroma setup', image: null, order: 3 },
  { id: 4, title: 'Kitchen Area', description: 'Full kitchenette with modern amenities', image: null, order: 4 },
  { id: 5, title: 'Lounge Space', description: 'Client lounge and waiting area', image: null, order: 5 }
];

const SAMPLE_PORTFOLIO = [
  { id: 1, category: 'COMMERCIAL', title: 'Nike - "Run NYC"', client: 'Wieden+Kennedy', thumbnail: null, videoUrl: null },
  { id: 2, category: 'MUSIC VIDEO', title: 'Artist - "Track Name"', client: 'Label Records', thumbnail: null, videoUrl: null },
  { id: 3, category: 'BRANDED', title: 'Brand Campaign', client: 'Agency Name', thumbnail: null, videoUrl: null },
  { id: 4, category: 'COMMERCIAL', title: 'Product Launch', client: 'Brand Name', thumbnail: null, videoUrl: null },
  { id: 5, category: 'EDITORIAL', title: 'Magazine Feature', client: 'Publication', thumbnail: null, videoUrl: null },
  { id: 6, category: 'MUSIC VIDEO', title: 'Music Video Title', client: 'Artist Name', thumbnail: null, videoUrl: null }
];

const SAMPLE_DRONE_PORTFOLIO = [
  { id: 1, category: 'COMMERCIAL', title: 'NYC Skyline - Brand Film', client: 'Fortune 500 Client', thumbnail: null, videoUrl: null },
  { id: 2, category: 'MUSIC VIDEO', title: 'Rooftop Performance', client: 'Major Label Artist', thumbnail: null, videoUrl: null },
  { id: 3, category: 'REAL ESTATE', title: 'Luxury Development', client: 'Douglas Elliman', thumbnail: null, videoUrl: null },
  { id: 4, category: 'LIVE EVENT', title: 'Concert Coverage', client: 'Live Nation', thumbnail: null, videoUrl: null },
  { id: 5, category: 'COMMERCIAL', title: 'Car Chase Sequence', client: 'Automotive Brand', thumbnail: null, videoUrl: null },
  { id: 6, category: 'FPV', title: 'Warehouse FPV', client: 'Fashion Brand', thumbnail: null, videoUrl: null }
];

const SAMPLE_BLOG_POSTS = [
  { id: 1, category: 'INDUSTRY NEWS', title: 'The Infrastructure Shift: Why Production Is Having Its AWS Moment', date: 'Dec 8, 2025', thumbnail: null, excerpt: '' },
  { id: 2, category: 'NYC CULTURE & EVENTS', title: 'Best Photo Walks in NYC This Winter', date: 'Dec 5, 2025', thumbnail: null, excerpt: '' },
  { id: 3, category: 'SPOTLIGHTS', title: 'Creator Spotlight: Marcus Rivera, DP', date: 'Dec 2, 2025', thumbnail: null, excerpt: '' },
  { id: 4, category: 'INDUSTRY NEWS', title: 'The Producer\'s Dilemma', date: 'Nov 22, 2025', thumbnail: null, excerpt: '' }
];

const SAMPLE_CLIENT_LOGOS = [
  { id: 1, name: 'Client 1', logo: null, order: 1 },
  { id: 2, name: 'Client 2', logo: null, order: 2 },
  { id: 3, name: 'Client 3', logo: null, order: 3 },
  { id: 4, name: 'Client 4', logo: null, order: 4 },
  { id: 5, name: 'Client 5', logo: null, order: 5 },
  { id: 6, name: 'Client 6', logo: null, order: 6 }
];

// ============================================
// STATIC DATA (Not CMS-managed)
// ============================================

const DRONE_CAPABILITIES = [
  { title: 'Standard Aerial', desc: 'DJI Inspire & Mavic systems for smooth, cinematic shots. 4K-8K resolution.' },
  { title: 'FPV Cinematography', desc: 'Dynamic, immersive footage with first-person-view systems.' },
  { title: 'Indoor Flying', desc: 'Specialized micro drones for interior spaces.' },
  { title: 'Live Events', desc: 'Real-time aerial coverage for concerts and events.' }
];

const DRONE_EQUIPMENT = [
  { title: 'DJI Inspire 3', specs: 'Full-frame 8K, interchangeable lenses, RTK positioning' },
  { title: 'DJI Mavic 3 Pro', specs: 'Hasselblad camera, triple-lens system, 46-min flight' },
  { title: 'Custom FPV Builds', specs: 'GoPro Hero 12, cinematic stabilization, high-speed capability' }
];

const CONTACT_REASONS = ['Book a studio', 'Start a project', 'Workspace inquiry', 'Network access', 'Partnership inquiry', 'Schedule a tour', 'General inquiry'];

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedReason, setSelectedReason] = useState('');
  const [expandedService, setExpandedService] = useState(null);
  const [selectedServiceItem, setSelectedServiceItem] = useState(null);
  const [activePortfolioCategory, setActivePortfolioCategory] = useState('ALL');
  const [activeDroneCategory, setActiveDroneCategory] = useState('ALL');
  const [showTour, setShowTour] = useState(false);
  const [tourSlide, setTourSlide] = useState(0);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState(0);
  const [showDronePortfolioModal, setShowDronePortfolioModal] = useState(false);
  const [selectedDronePortfolioIndex, setSelectedDronePortfolioIndex] = useState(0);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // CMS Data Hooks
  const { data: leaders } = useCMSData(CONFIG.COLLECTIONS.LEADERS, WebflowService.transformLeader, SAMPLE_LEADERS);
  const { data: tourSlides } = useCMSData(CONFIG.COLLECTIONS.TOUR_SLIDES, WebflowService.transformTourSlide, SAMPLE_TOUR_SLIDES);
  const { data: portfolioItems } = useCMSData(CONFIG.COLLECTIONS.PORTFOLIO, WebflowService.transformPortfolioItem, SAMPLE_PORTFOLIO);
  const { data: dronePortfolioItems } = useCMSData(CONFIG.COLLECTIONS.DRONE_PORTFOLIO, WebflowService.transformPortfolioItem, SAMPLE_DRONE_PORTFOLIO);
  const { data: blogPosts } = useCMSData(CONFIG.COLLECTIONS.BLOG_POSTS, WebflowService.transformBlogPost, SAMPLE_BLOG_POSTS);
  const { data: clientLogos } = useCMSData(CONFIG.COLLECTIONS.CLIENT_LOGOS, WebflowService.transformClientLogo, SAMPLE_CLIENT_LOGOS);
  const { data: productionServices } = useCMSData(CONFIG.COLLECTIONS.PRODUCTION_SERVICES, WebflowService.transformProductionService, []);
  const { data: studioAmenities } = useCMSData(CONFIG.COLLECTIONS.STUDIO_AMENITIES, WebflowService.transformStudioAmenity, []);
  const { data: connectFeatures } = useCMSData(CONFIG.COLLECTIONS.CONNECT_FEATURES, WebflowService.transformConnectFeature, []);
  const { data: heroContent } = useCMSData(CONFIG.COLLECTIONS.HERO_CONTENT, WebflowService.transformHeroContent, []);
  // Get hero content for specific page
  const getHeroForPage = (pageName) => {
    const hero = heroContent.find(h => h.page === pageName);
    return hero || null;
  };
  // Group production services by category
  const groupedProductionServices = React.useMemo(() => {
    const grouped = {};
    productionServices.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = {
          title: service.category,
          categoryOrder: service.categoryOrder,
          services: []
        };
      }
      grouped[service.category].services.push({
        name: service.name,
        copy: service.description
      });
    });
    // Convert to array and sort
    return Object.values(grouped)
      .sort((a, b) => a.categoryOrder - b.categoryOrder)
      .map(cat => ({
        ...cat,
        services: cat.services.sort((a, b) => a.order - b.order)
      }));
  }, [productionServices]);
  // Filter connect features by plan type
  const coworkingFeatures = React.useMemo(() => {
    return [...connectFeatures]
      .filter(f => f.planType === '5383df699e111ca346fcf609db644274')
      .sort((a, b) => a.order - b.order);
  }, [connectFeatures]);

  const privateOfficeFeatures = React.useMemo(() => {
    return [...connectFeatures]
      .filter(f => f.planType === '91b893cfdb755c9b177df15917d819a7')
      .sort((a, b) => a.order - b.order);
  }, [connectFeatures]);

  // Sort CMS data by order field where applicable
  const sortedLeaders = [...leaders].sort((a, b) => a.order - b.order);
  const sortedTourSlides = [...tourSlides].sort((a, b) => a.order - b.order);
  const sortedClientLogos = [...clientLogos].sort((a, b) => a.order - b.order);

  // Responsive breakpoints
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const goTo = (page) => {
    setCurrentPage(page);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    setExpandedService(null);
    setSelectedServiceItem(null);
    setSelectedArticle(null);
    window.scrollTo(0, 0);
  };

  const goToArticle = (article) => {
    setSelectedArticle(article);
    setCurrentPage('article');
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const colors = {
    bg: '#0A0A0A',
    cream: '#F5F0E6',
    red: '#ED1C24',
    redDark: '#B8151B',
    gray: '#8A8A8A',
    darkGray: '#161616',
    midGray: '#2A2A2A'
  };

  const redGradient = 'linear-gradient(135deg, #ED1C24 0%, #B8151B 100%)';

  const pageTitles = {
    home: 'Home', about: 'About', studios: 'Studios', production: 'Production',
    connect: 'Connect', drone: 'Drone & Aerial', agencies: 'Agencies',
    entertainment: 'Entertainment', fashion: 'Fashion Brands', creatives: 'Creatives',
    blog: 'The Dailies', article: 'Article', contact: 'Contact', login: 'Client Login', 
    membership: 'Membership Application', privacy: 'Privacy Policy', terms: 'Terms of Service'
  };

  const getBreadcrumbs = (page) => {
    const crumbs = [{ label: 'Home', page: 'home' }];
    if (page === 'home') return [];
    if (['studios', 'production', 'connect'].includes(page)) {
      crumbs.push({ label: pageTitles[page], page: page });
    } else if (page === 'drone') {
      crumbs.push({ label: 'Production', page: 'production' });
      crumbs.push({ label: 'Drone & Aerial', page: 'drone' });
    } else if (['agencies', 'entertainment', 'fashion', 'creatives'].includes(page)) {
      crumbs.push({ label: 'Solutions', page: null });
      crumbs.push({ label: pageTitles[page], page: page });
    } else if (page === 'membership') {
      crumbs.push({ label: 'Connect', page: 'connect' });
      crumbs.push({ label: 'Membership Application', page: 'membership' });
    } else if (page === 'article' && selectedArticle) {
      crumbs.push({ label: 'The Dailies', page: 'blog' });
      crumbs.push({ label: selectedArticle.title.length > 40 ? selectedArticle.title.substring(0, 40) + '...' : selectedArticle.title, page: null });
    } else if (['privacy', 'terms'].includes(page)) {
      crumbs.push({ label: 'Legal', page: null });
      crumbs.push({ label: pageTitles[page], page: page });
    } else {
      crumbs.push({ label: pageTitles[page], page: page });
    }
    return crumbs;
  };

  const handleServiceTagClick = (categoryIndex, serviceIndex, e) => {
    e.stopPropagation();
    setExpandedService(categoryIndex);
    setSelectedServiceItem(serviceIndex);
  };

  // ============================================
  // SHARED COMPONENTS
  // ============================================

  const Breadcrumbs = () => {
    const crumbs = getBreadcrumbs(currentPage);
    if (crumbs.length === 0) return null;
    return (
      <div style={{ padding: isMobile ? '16px 20px' : '16px 48px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {crumb.page ? (
              <span onClick={() => goTo(crumb.page)} style={{ fontSize: '12px', color: i === crumbs.length - 1 ? colors.cream : colors.gray, cursor: i === crumbs.length - 1 ? 'default' : 'pointer', letterSpacing: '0.5px' }}>{crumb.label}</span>
            ) : (
              <span style={{ fontSize: '12px', color: colors.gray, letterSpacing: '0.5px' }}>{crumb.label}</span>
            )}
            {i < crumbs.length - 1 && <span style={{ color: colors.gray, fontSize: '10px' }}>›</span>}
          </span>
        ))}
      </div>
    );
  };

  const HamburgerIcon = ({ isOpen, onClick }) => (
    <div onClick={onClick} style={{ cursor: 'pointer', padding: '10px', zIndex: 1001 }}>
      <div style={{ width: '24px', height: '2px', backgroundColor: colors.cream, marginBottom: '6px', transition: 'all 0.3s', transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
      <div style={{ width: '24px', height: '2px', backgroundColor: colors.cream, marginBottom: '6px', transition: 'all 0.3s', opacity: isOpen ? 0 : 1 }} />
      <div style={{ width: '24px', height: '2px', backgroundColor: colors.cream, transition: 'all 0.3s', transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }} />
    </div>
  );

  const MobileMenu = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 999, padding: '80px 20px 20px', overflowY: 'auto', transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '2px', color: colors.gray, padding: '16px 0 8px' }}>MENU</p>
        {[{ label: 'Home', page: 'home' }, { label: 'About', page: 'about' }].map((item, i) => (
          <div key={i} onClick={() => goTo(item.page)} style={{ padding: '16px 0', borderBottom: '1px solid #1A1A1A', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}>{item.label}</div>
        ))}
        <p style={{ fontSize: '10px', letterSpacing: '2px', color: colors.gray, padding: '24px 0 8px' }}>SOLUTIONS</p>
        {[{ label: 'Studios', page: 'studios' }, { label: 'Production', page: 'production' }, { label: 'Connect', page: 'connect' }].map((item, i) => (
          <div key={i} onClick={() => goTo(item.page)} style={{ padding: '16px 0', borderBottom: '1px solid #1A1A1A', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}>{item.label}</div>
        ))}
        <p style={{ fontSize: '10px', letterSpacing: '2px', color: colors.gray, padding: '24px 0 8px' }}>BY INDUSTRY</p>
        {[{ label: 'Agencies', page: 'agencies' }, { label: 'Entertainment', page: 'entertainment' }, { label: 'Fashion Brands', page: 'fashion' }, { label: 'Creatives', page: 'creatives' }].map((item, i) => (
          <div key={i} onClick={() => goTo(item.page)} style={{ padding: '16px 0', borderBottom: '1px solid #1A1A1A', fontSize: '16px', cursor: 'pointer', color: colors.gray }}>{item.label}</div>
        ))}
        <p style={{ fontSize: '10px', letterSpacing: '2px', color: colors.gray, padding: '24px 0 8px' }}>MORE</p>
        {[{ label: 'The Dailies', page: 'blog' }, { label: 'Client Login', page: 'login' }, { label: 'Contact', page: 'contact', highlight: true }].map((item, i) => (
          <div key={i} onClick={() => goTo(item.page)} style={{ padding: '16px 0', borderBottom: '1px solid #1A1A1A', fontSize: '16px', cursor: 'pointer', color: item.highlight ? colors.red : colors.cream }}>{item.label}</div>
        ))}
      </div>
    </div>
  );

  // ============================================
  // GLOBAL ANIMATION STYLES
  // ============================================

  const GlobalAnimationStyles = () => (
    <style>{`
      /* Infinite Scroll Marquee */
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      .marquee-container {
        overflow: hidden;
        position: relative;
        flex: 1;
        margin-right: -48px;
      }

      .marquee-container::before,
      .marquee-container::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100px;
        z-index: 2;
        pointer-events: none;
      }

      .marquee-container::before {
        left: 0;
        background: linear-gradient(to right, #0A0A0A 0%, #0A0A0A 30%, transparent 100%);
      }

      .marquee-container::after {
        right: 0;
        background: linear-gradient(to left, #0A0A0A 0%, #0A0A0A 30%, transparent 100%);
      }

      .marquee-track {
        display: flex;
        gap: 48px;
        animation: marquee 25s linear infinite;
        width: max-content;
      }

      .marquee-track:hover {
        animation-play-state: paused;
      }

      /* Industry/Service Card Hover - Pure CSS to avoid React re-renders */
      .industry-card {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .industry-card:hover {
        background: linear-gradient(135deg, #ED1C24 0%, #B8151B 100%) !important;
      }
      
      .industry-card .card-title {
        transition: color 0.3s ease;
      }
      
      .industry-card .card-subtitle {
        transition: color 0.3s ease;
      }
      
      .industry-card .card-desc {
        transition: color 0.3s ease;
      }
      
      .industry-card .card-cta {
        transition: color 0.3s ease;
      }
      
      .industry-card:hover .card-title {
        color: #fff !important;
      }
      
      .industry-card:hover .card-subtitle {
        color: #fff !important;
      }
      
      .industry-card:hover .card-desc {
        color: rgba(255,255,255,0.9) !important;
      }
      
      .industry-card:hover .card-cta {
        color: #fff !important;
      }

      /* Fade In Animations */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes slideInFromBottom {
        from {
          opacity: 0;
          transform: translateY(60px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      /* Animation Classes */
      .animate-fade-in-up {
        opacity: 0;
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .animate-fade-in-left {
        opacity: 0;
        animation: fadeInLeft 0.8s ease-out forwards;
      }

      .animate-fade-in-right {
        opacity: 0;
        animation: fadeInRight 0.8s ease-out forwards;
      }

      .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
      }

      .animate-scale-in {
        opacity: 0;
        animation: scaleIn 0.6s ease-out forwards;
      }

      .animate-slide-in {
        opacity: 0;
        animation: slideInFromBottom 0.8s ease-out forwards;
      }

      /* Staggered Animation Delays */
      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      .delay-300 { animation-delay: 0.3s; }
      .delay-400 { animation-delay: 0.4s; }
      .delay-500 { animation-delay: 0.5s; }
      .delay-600 { animation-delay: 0.6s; }

      /* Hover Transitions */
      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }

      .hover-glow {
        transition: box-shadow 0.3s ease;
      }

      .hover-glow:hover {
        box-shadow: 0 0 30px rgba(237, 28, 36, 0.2);
      }

      /* Button Animations */
      .btn-animated {
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .btn-animated::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }

      .btn-animated:hover::before {
        left: 100%;
      }

      .btn-animated:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(237, 28, 36, 0.3);
      }

      .btn-animated:active {
        transform: translateY(0);
      }

      /* Card Hover Effects */
      .card-hover {
        transition: transform 0.3s ease, background 0.3s ease;
      }

      .card-hover:hover {
        transform: translateY(-2px);
      }

      /* Image Hover Effects */
      .img-hover-zoom {
        overflow: hidden;
      }

      .img-hover-zoom img {
        transition: transform 0.5s ease;
      }

      .img-hover-zoom:hover img {
        transform: scale(1.05);
      }

      /* Text Gradient Animation */
      .text-gradient-animated {
        background-size: 200% auto;
        animation: shimmer 3s linear infinite;
      }

      /* Scroll Reveal Styles */
      .scroll-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }

      .scroll-reveal.revealed {
        opacity: 1;
        transform: translateY(0);
      }

      /* Nav Link Underline Animation */
      .nav-link {
        position: relative;
      }

      .nav-link::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(135deg, #ED1C24 0%, #B8151B 100%);
        transition: width 0.3s ease;
      }

      .nav-link:hover::after {
        width: 100%;
      }

      /* Play Button Pulse */
      .play-btn-pulse {
        animation: pulse 2s ease-in-out infinite;
      }

      .play-btn-pulse:hover {
        animation: none;
        transform: scale(1.1);
        transition: transform 0.3s ease;
      }

      /* Loading Skeleton */
      .skeleton {
        background: linear-gradient(90deg, #1A1A1A 25%, #2A2A2A 50%, #1A1A1A 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      /* Smooth Section Transitions */
      section {
        transition: opacity 0.3s ease;
      }

      /* Form Input Focus Animation */
      input:focus, textarea:focus, select:focus {
        border-color: #ED1C24 !important;
        box-shadow: 0 0 0 2px rgba(237, 28, 36, 0.1);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }

      /* Tag/Chip Hover */
      .tag-hover {
        transition: all 0.2s ease;
      }

      .tag-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }

      /* Portfolio Card Overlay */
      .portfolio-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .portfolio-card:hover .portfolio-overlay {
        opacity: 1;
      }

      /* Breadcrumb Separator Animation */
      .breadcrumb-sep {
        display: inline-block;
        transition: transform 0.2s ease;
      }

      .breadcrumb-item:hover + .breadcrumb-sep {
        transform: translateX(2px);
      }
    `}</style>
  );

  // Custom hook for scroll-triggered animations
  const useScrollAnimation = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }, [threshold]);

    return [ref, isVisible];
  };

  // Animated Section Wrapper
  const AnimatedSection = ({ children, animation = 'fade-in-up', delay = 0, style = {} }) => {
    const [ref, isVisible] = useScrollAnimation(0.1);
    
    return (
      <div 
        ref={ref} 
        className={isVisible ? `animate-${animation}` : ''} 
        style={{ 
          ...style, 
          opacity: isVisible ? undefined : 0,
          animationDelay: `${delay}s`
        }}
      >
        {children}
      </div>
    );
  };

  const ClientLogoMarquee = () => {
    // Duplicate logos for seamless infinite scroll
    const duplicatedLogos = [...sortedClientLogos, ...sortedClientLogos];
    
    return (
      <section style={{ 
        borderTop: '1px solid #1A1A1A', 
        borderBottom: '1px solid #1A1A1A', 
        padding: isMobile ? '24px 20px' : '32px 48px', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: isMobile ? '16px' : '32px',
        overflow: 'hidden'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: colors.gray, 
          letterSpacing: '2px',
          flexShrink: 0,
          zIndex: 3
        }}>TRUSTED BY</p>
        
        {isMobile ? (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {sortedClientLogos.map((logo, i) => (
              logo.logo ? (
                <img 
                  key={logo.id} 
                  src={logo.logo} 
                  alt={logo.name} 
                  style={{ 
                    height: '24px', 
                    objectFit: 'contain', 
                    filter: 'grayscale(100%) brightness(0.5)',
                    transition: 'filter 0.3s ease, transform 0.3s ease'
                  }} 
                />
              ) : (
                <span key={logo.id} style={{ color: '#4A4A4A', fontWeight: '700', fontSize: '12px' }}>[Logo {i + 1}]</span>
              )
            ))}
          </div>
        ) : (
          <div className="marquee-container">
            <div className="marquee-track">
              {duplicatedLogos.map((logo, i) => (
                logo.logo ? (
                  <img 
                    key={`${logo.id}-${i}`} 
                    src={logo.logo} 
                    alt={logo.name} 
                    style={{ 
                      height: '24px', 
                      objectFit: 'contain', 
                      filter: 'grayscale(100%) brightness(0.5)',
                      transition: 'filter 0.3s ease, transform 0.3s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'grayscale(0%) brightness(1)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'grayscale(100%) brightness(0.5)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                ) : (
                  <span 
                    key={`${logo.id}-${i}`} 
                    style={{ 
                      color: '#4A4A4A', 
                      fontWeight: '700', 
                      fontSize: '14px',
                      flexShrink: 0,
                      transition: 'color 0.3s ease'
                    }}
                  >[Logo {(i % sortedClientLogos.length) + 1}]</span>
                )
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  const HeroSection = ({ tag, title, subtitle, buttonText, buttonAction, secondaryButton, heroImage }) => (
    <section style={{ position: 'relative', padding: heroImage ? '0' : (isMobile ? '60px 20px 40px' : '80px 48px 60px'), minHeight: heroImage ? (isMobile ? '400px' : '500px') : 'auto', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {heroImage && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.midGray, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#4A4A4A' }}>[Hero Image: {heroImage}]</div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 100%)' }} />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1, padding: heroImage ? (isMobile ? '60px 20px' : '80px 48px') : '0', maxWidth: '700px' }}>
        <p className="animate-fade-in-up" style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: isMobile ? '16px' : '24px', animationDelay: '0.1s' }}>{tag}</p>
        <h1 className="animate-fade-in-up" style={{ fontSize: isMobile ? '36px' : isTablet ? '44px' : '56px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-2px', margin: '0 0 24px 0', animationDelay: '0.2s' }}>{title}</h1>
        <p className="animate-fade-in-up" style={{ fontSize: isMobile ? '16px' : '18px', color: colors.gray, lineHeight: '1.7', marginBottom: isMobile ? '32px' : '40px', animationDelay: '0.3s' }}>{subtitle}</p>
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', animationDelay: '0.4s' }}>
          {buttonText && <button className="btn-animated" onClick={buttonAction} style={{ background: redGradient, color: '#fff', border: 'none', padding: '16px 32px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>{buttonText}</button>}
          {secondaryButton && <button className="btn-animated" onClick={secondaryButton.action} style={{ backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '16px 32px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', transition: 'border-color 0.3s ease, background-color 0.3s ease' }} onMouseEnter={(e) => { e.target.style.borderColor = colors.red; e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; }} onMouseLeave={(e) => { e.target.style.borderColor = '#2A2A2A'; e.target.style.backgroundColor = 'transparent'; }}>{secondaryButton.text}</button>}
        </div>
      </div>
    </section>
  );

  // ============================================
  // MODALS
  // ============================================

  const LeadershipModal = () => {
    if (!showLeaderModal || !selectedLeader) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px' : '40px' }}>
        <div style={{ maxWidth: '700px', width: '100%', backgroundColor: colors.darkGray, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
          <span style={{ position: 'absolute', top: '16px', right: '16px', color: colors.cream, cursor: 'pointer', fontSize: '24px', zIndex: 10 }} onClick={() => setShowLeaderModal(false)}>✕</span>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ width: isMobile ? '100%' : '250px', height: isMobile ? '200px' : 'auto', minHeight: isMobile ? 'auto' : '400px', backgroundColor: colors.midGray, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', flexShrink: 0, overflow: 'hidden' }}>
              {selectedLeader.photo ? (
                <img src={selectedLeader.photo} alt={selectedLeader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '[Photo]'
              )}
            </div>
            <div style={{ padding: isMobile ? '24px' : '40px', flex: 1 }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{selectedLeader.title.toUpperCase()}</p>
              <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginBottom: '24px' }}>{selectedLeader.name}</h2>
              <p style={{ fontSize: '14px', color: colors.gray, lineHeight: '1.8', marginBottom: '24px' }}>{selectedLeader.bio}</p>
              <p style={{ fontSize: '14px', color: colors.cream, fontStyle: 'italic' }}>{selectedLeader.philosophy}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VideoModal = () => {
    if (!showVideoModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px' : '40px' }} onClick={() => setShowVideoModal(false)}>
        <div style={{ maxWidth: '1000px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <span style={{ position: 'absolute', top: '-40px', right: '0', color: colors.cream, cursor: 'pointer', fontSize: '24px' }} onClick={() => setShowVideoModal(false)}>✕</span>
          <video autoPlay controls style={{ width: '100%', backgroundColor: '#000' }}>
            <source src="/home.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    );
  };

  const PortfolioModal = () => {
    if (!showPortfolioModal) return null;
    const filtered = portfolioItems.filter(item => activePortfolioCategory === 'ALL' || item.category === activePortfolioCategory);
    const current = filtered[selectedPortfolioIndex];
    if (!current) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px' : '40px' }} onClick={() => setShowPortfolioModal(false)}>
        <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <span style={{ position: 'absolute', top: isMobile ? '-30px' : '-40px', right: '0', color: colors.cream, cursor: 'pointer', fontSize: '24px' }} onClick={() => setShowPortfolioModal(false)}>✕</span>
          <div style={{ backgroundColor: colors.midGray, height: isMobile ? '250px' : '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', marginBottom: '24px', overflow: 'hidden' }}>
            {current.thumbnail ? (
              <img src={current.thumbnail} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              `[Project: ${current.title}]`
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{current.category}</p>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: colors.cream }}>{current.title}</h3>
              <p style={{ fontSize: '14px', color: colors.gray }}>{current.client}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
              <button onClick={() => setSelectedPortfolioIndex(p => p === 0 ? filtered.length - 1 : p - 1)} style={{ backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '12px 24px', fontSize: '12px', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>← PREV</button>
              <span style={{ fontSize: '12px', color: colors.gray, whiteSpace: 'nowrap' }}>{selectedPortfolioIndex + 1} / {filtered.length}</span>
              <button onClick={() => setSelectedPortfolioIndex(p => p === filtered.length - 1 ? 0 : p + 1)} style={{ background: redGradient, color: '#fff', border: 'none', padding: '12px 24px', fontSize: '12px', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>NEXT →</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DronePortfolioModal = () => {
    if (!showDronePortfolioModal) return null;
    const filtered = dronePortfolioItems.filter(item => activeDroneCategory === 'ALL' || item.category === activeDroneCategory);
    const current = filtered[selectedDronePortfolioIndex];
    if (!current) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px' : '40px' }} onClick={() => setShowDronePortfolioModal(false)}>
        <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <span style={{ position: 'absolute', top: isMobile ? '-30px' : '-40px', right: '0', color: colors.cream, cursor: 'pointer', fontSize: '24px' }} onClick={() => setShowDronePortfolioModal(false)}>✕</span>
          <div style={{ backgroundColor: colors.midGray, height: isMobile ? '250px' : '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', marginBottom: '24px', overflow: 'hidden' }}>
            {current.thumbnail ? (
              <img src={current.thumbnail} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              `[Aerial Project: ${current.title}]`
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{current.category}</p>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: colors.cream }}>{current.title}</h3>
              <p style={{ fontSize: '14px', color: colors.gray }}>{current.client}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
              <button onClick={() => setSelectedDronePortfolioIndex(p => p === 0 ? filtered.length - 1 : p - 1)} style={{ backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '12px 24px', fontSize: '12px', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>← PREV</button>
              <span style={{ fontSize: '12px', color: colors.gray, whiteSpace: 'nowrap' }}>{selectedDronePortfolioIndex + 1} / {filtered.length}</span>
              <button onClick={() => setSelectedDronePortfolioIndex(p => p === filtered.length - 1 ? 0 : p + 1)} style={{ background: redGradient, color: '#fff', border: 'none', padding: '12px 24px', fontSize: '12px', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>NEXT →</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // NAVIGATION
  // ============================================

  const Nav = () => (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '16px 20px' : '24px 48px', borderBottom: '1px solid #1A1A1A', position: 'sticky', top: 0, backgroundColor: colors.bg, zIndex: 100, backdropFilter: 'blur(10px)' }}>
      <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s ease' }} onClick={() => goTo('home')} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>BASE NYC</div>
      {isMobile ? (
        <HamburgerIcon isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      ) : (
        <div style={{ display: 'flex', gap: isTablet ? '24px' : '40px', fontSize: '13px', letterSpacing: '0.5px', alignItems: 'center' }}>
          <span className="nav-link" style={{ color: currentPage === 'about' ? colors.cream : colors.gray, cursor: 'pointer', transition: 'color 0.2s ease' }} onClick={() => goTo('about')} onMouseEnter={(e) => e.target.style.color = colors.cream} onMouseLeave={(e) => e.target.style.color = currentPage === 'about' ? colors.cream : colors.gray}>ABOUT</span>
          <div style={{ position: 'relative' }}>
            <span className="nav-link" style={{ color: ['studios', 'production', 'connect', 'drone'].includes(currentPage) ? colors.cream : colors.gray, cursor: 'pointer', transition: 'color 0.2s ease' }} onClick={() => setShowDropdown(!showDropdown)} onMouseEnter={(e) => e.target.style.color = colors.cream} onMouseLeave={(e) => e.target.style.color = ['studios', 'production', 'connect', 'drone'].includes(currentPage) ? colors.cream : colors.gray}>SOLUTIONS ↓</span>
            {showDropdown && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: '100%', left: '-20px', backgroundColor: colors.darkGray, padding: '8px 0', minWidth: '200px', marginTop: '8px', zIndex: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #2A2A2A' }}>
                <p style={{ padding: '8px 20px', fontSize: '10px', letterSpacing: '2px', color: colors.gray }}>OFFERINGS</p>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('studios')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Studios</div>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('production')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Production</div>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('connect')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Connect</div>
                <div style={{ height: '1px', backgroundColor: '#2A2A2A', margin: '8px 0' }} />
                <p style={{ padding: '8px 20px', fontSize: '10px', letterSpacing: '2px', color: colors.gray }}>BY INDUSTRY</p>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('agencies')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Agencies</div>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('entertainment')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Entertainment</div>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('fashion')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Fashion Brands</div>
                <div style={{ padding: '12px 20px', cursor: 'pointer', color: colors.cream, transition: 'background-color 0.2s ease, padding-left 0.2s ease' }} onClick={() => goTo('creatives')} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; e.target.style.paddingLeft = '28px'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.paddingLeft = '20px'; }}>Creatives</div>
              </div>
            )}
          </div>
          <span className="nav-link" style={{ color: currentPage === 'blog' ? colors.cream : colors.gray, cursor: 'pointer', transition: 'color 0.2s ease' }} onClick={() => goTo('blog')} onMouseEnter={(e) => e.target.style.color = colors.cream} onMouseLeave={(e) => e.target.style.color = currentPage === 'blog' ? colors.cream : colors.gray}>THE DAILIES</span>
          <span className="nav-link" style={{ color: currentPage === 'login' ? colors.cream : colors.gray, cursor: 'pointer', transition: 'color 0.2s ease' }} onClick={() => goTo('login')} onMouseEnter={(e) => e.target.style.color = colors.cream} onMouseLeave={(e) => e.target.style.color = currentPage === 'login' ? colors.cream : colors.gray}>CLIENT LOGIN</span>
          <span className="btn-animated" style={{ background: redGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', fontWeight: '700', padding: '8px 0' }} onClick={() => goTo('contact')}>CONTACT</span>
        </div>
      )}
    </nav>
  );

  const SubNav = () => (
    <div style={{ padding: isMobile ? '12px 20px' : '16px 48px', borderBottom: '1px solid #1A1A1A', display: 'flex', gap: isMobile ? '20px' : '32px', overflowX: 'auto' }}>
      <span style={{ fontSize: '12px', color: currentPage === 'studios' ? colors.red : colors.gray, letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => goTo('studios')}>STUDIOS</span>
      <span style={{ fontSize: '12px', color: ['production', 'drone'].includes(currentPage) ? colors.red : colors.gray, letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => goTo('production')}>PRODUCTION</span>
      <span style={{ fontSize: '12px', color: currentPage === 'connect' ? colors.red : colors.gray, letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => goTo('connect')}>CONNECT</span>
    </div>
  );

  const Footer = () => (
    <footer style={{ padding: isMobile ? '40px 20px' : '48px', borderTop: '1px solid #1A1A1A' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: isMobile ? '40px' : '0' }}>
        <div>
          <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', cursor: 'pointer' }} onClick={() => goTo('home')}>BASE NYC</p>
          <p style={{ fontSize: '13px', color: colors.gray }}>The Creative Infrastructure Company</p>
          {CONFIG.USE_SAMPLE_DATA && <p style={{ fontSize: '10px', color: '#444', marginTop: '8px' }}>Demo Mode — CMS not connected</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, auto)', gap: isMobile ? '32px' : '64px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '16px' }}>SOLUTIONS</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('studios')}>Base Studios</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('production')}>Base Production</p>
            <p style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => goTo('connect')}>Base Connect</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '16px' }}>INDUSTRIES</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('agencies')}>Agencies</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('entertainment')}>Entertainment</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('fashion')}>Fashion Brands</p>
            <p style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => goTo('creatives')}>Creatives</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '16px' }}>CONNECT</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('blog')}>The Dailies</p>
            <p style={{ fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => goTo('contact')}>Contact</p>
            <p style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => goTo('login')}>Client Login</p>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #1A1A1A', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
        <p style={{ fontSize: '12px', color: colors.gray }}>© 2025 Base NYC. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ fontSize: '12px', color: colors.gray, cursor: 'pointer' }} onClick={() => goTo('privacy')}>Privacy</span>
          <span style={{ fontSize: '12px', color: colors.gray, cursor: 'pointer' }} onClick={() => goTo('terms')}>Terms</span>
        </div>
      </div>
    </footer>
  );

  // ============================================
  // PAGES
  // ============================================

  const HomePage = () => (
    <>
      <section style={{ position: 'relative', minHeight: isMobile ? '70vh' : '80vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.midGray, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <video autoPlay muted loop playsInline style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%', objectFit: 'cover' }}>
            <source src="/home.mp4" type="video/mp4" />
          </video>
          <div className="play-btn-pulse" onClick={() => setShowVideoModal(true)} style={{ position: 'relative', zIndex: 2, width: isMobile ? '60px' : '80px', height: isMobile ? '60px' : '80px', border: '2px solid rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.3)', transition: 'transform 0.3s ease, background-color 0.3s ease' }}>
            <span style={{ fontSize: isMobile ? '20px' : '28px', marginLeft: '4px', color: '#fff' }}>▶</span>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,10,0.7)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: isMobile ? '80px 20px 60px' : '120px 48px 80px' }}>
          <p className="animate-fade-in-up" style={{ fontSize: '11px', letterSpacing: '3px', color: colors.gray, marginBottom: isMobile ? '16px' : '24px', animationDelay: '0.1s' }}>THE CREATIVE INFRASTRUCTURE COMPANY</p>
          <h1 className="animate-fade-in-up" style={{ fontSize: isMobile ? '36px' : isTablet ? '48px' : '64px', fontWeight: '700', lineHeight: '1.05', letterSpacing: '-2px', maxWidth: '900px', margin: '0 0 24px 0', animationDelay: '0.2s' }}>
            Stop managing vendors.<br/><span style={{ background: redGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Start making things.</span>
          </h1>
          <p className="animate-fade-in-up" style={{ fontSize: isMobile ? '16px' : '18px', color: colors.gray, maxWidth: '560px', lineHeight: '1.6', marginBottom: isMobile ? '32px' : '40px', animationDelay: '0.3s' }}>Base is the foundational layer for production in NYC. Studio space, equipment, services, and talent—integrated into one platform.</p>
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', animationDelay: '0.4s' }}>
            <button className="btn-animated" onClick={() => goTo('contact')} style={{ background: redGradient, color: '#fff', border: 'none', padding: '16px 32px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer' }}>BOOK A TOUR</button>
            <button className="btn-animated" onClick={() => goTo('studios')} style={{ backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '16px 32px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', transition: 'border-color 0.3s ease, background-color 0.3s ease' }} onMouseEnter={(e) => { e.target.style.borderColor = colors.red; e.target.style.backgroundColor = 'rgba(237, 28, 36, 0.1)'; }} onMouseLeave={(e) => { e.target.style.borderColor = '#2A2A2A'; e.target.style.backgroundColor = 'transparent'; }}>SEE THE SPACE</button>
          </div>
        </div>
      </section>
      <ClientLogoMarquee />
      
      {/* WHO WE SERVE - Industry Pathways */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>WHO WE SERVE</p>
        <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>Built for how you work.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '2px' }}>
          {[{ title: 'AGENCIES', desc: 'Streamline production for your clients.', page: 'agencies' },
            { title: 'ENTERTAINMENT', desc: 'From music videos to episodic content.', page: 'entertainment' },
            { title: 'FASHION BRANDS', desc: 'Lookbooks, campaigns, and e-commerce.', page: 'fashion' },
            { title: 'CREATIVES', desc: 'Access agency-level infrastructure.', page: 'creatives' }
          ].map((p, i) => (
            <div 
              key={i}
              className="industry-card"
              onClick={() => goTo(p.page)} 
              style={{ 
                background: colors.darkGray, 
                padding: isMobile ? '32px 24px' : '40px'
              }}
            >
              <h3 className="card-title" style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', marginBottom: '16px', color: colors.cream }}>{p.title}</h3>
              <p className="card-desc" style={{ fontSize: '14px', color: colors.gray, marginBottom: '24px' }}>{p.desc}</p>
              <p className="card-cta" style={{ fontSize: '13px', fontWeight: '700', color: colors.red }}>Learn more →</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* WHAT WE OFFER - Three Pillars */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', backgroundColor: colors.darkGray }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>WHAT WE OFFER</p>
        <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>One location. Complete capability.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '2px' }}>
          {[{ title: 'BASE STUDIOS', sub: 'Physical Infrastructure', desc: 'Production-ready studio space.', cta: 'Explore →', page: 'studios' },
            { title: 'BASE PRODUCTION', sub: 'Services Infrastructure', desc: 'Pre-production through post.', cta: 'See services →', page: 'production' },
            { title: 'BASE CONNECT', sub: 'Network Infrastructure', desc: 'Coworking and vetted talent.', cta: 'Join →', page: 'connect' }
          ].map((p, i) => (
            <div 
              key={i}
              className="industry-card"
              onClick={() => goTo(p.page)} 
              style={{ 
                flex: 1, 
                background: colors.bg, 
                padding: isMobile ? '32px 24px' : '40px'
              }}
            >
              <p className="card-subtitle" style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{p.sub.toUpperCase()}</p>
              <h3 className="card-title" style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', marginBottom: '16px', color: colors.cream }}>{p.title}</h3>
              <p className="card-desc" style={{ fontSize: '14px', color: colors.gray, marginBottom: '24px' }}>{p.desc}</p>
              <p className="card-cta" style={{ fontSize: '13px', fontWeight: '700', color: colors.red }}>{p.cta}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* THE DAILIES - Latest Blog Posts from CMS */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: isMobile ? '32px' : '48px', gap: '16px' }}>
          <div>
            <p className="animate-fade-in-up" style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>THE DAILIES</p>
            <h2 className="animate-fade-in-up" style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', animationDelay: '0.1s' }}>Latest from the blog</h2>
          </div>
          <span className="animate-fade-in-up nav-link" onClick={() => goTo('blog')} style={{ fontSize: '13px', fontWeight: '700', color: colors.red, cursor: 'pointer', animationDelay: '0.2s' }}>View all posts →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '24px' }}>
          {blogPosts.slice(0, 3).map((post, i) => (
            <article 
              key={post.id} 
              className="hover-lift animate-fade-in-up img-hover-zoom"
              onClick={() => goToArticle(post)} 
              style={{ cursor: 'pointer', animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div style={{ backgroundColor: colors.midGray, height: isMobile ? '180px' : '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', marginBottom: '20px', overflow: 'hidden', borderRadius: '2px' }}>
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                ) : (
                  '[Thumbnail]'
                )}
              </div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '12px' }}>{post.category}</p>
              <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', marginBottom: '12px', transition: 'color 0.3s ease' }}>{post.title}</h3>
              <p style={{ fontSize: '12px', color: '#6A6A6A' }}>{post.date}</p>
            </article>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="animate-fade-in" style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Ready to see the space?</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>Book a tour of our Chinatown facility.</p>
          </div>
          <button className="btn-animated" onClick={() => goTo('contact')} style={{ backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>SCHEDULE A VISIT</button>
        </div>
      </section>
    </>
  );

  const AboutPage = () => (
    <>
      <Breadcrumbs />
      <HeroSection tag="ABOUT BASE" title="We built what we wished existed." subtitle="Base started with a simple frustration: why does every production require rebuilding the supply chain from scratch?" heroImage="Facility Exterior" />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px' }}>
        <p className="animate-fade-in-up" style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>LEADERSHIP</p>
        <h2 className="animate-fade-in-up" style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px', animationDelay: '0.1s' }}>The team behind Base</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
          {sortedLeaders.map((l, i) => (
            <div 
              key={l.id} 
              className="hover-lift animate-fade-in-up img-hover-zoom"
              onClick={() => { setSelectedLeader(l); setShowLeaderModal(true); }} 
              style={{ cursor: 'pointer', animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div style={{ backgroundColor: colors.darkGray, height: isMobile ? '250px' : '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', marginBottom: '20px', overflow: 'hidden', borderRadius: '2px' }}>
                {l.photo ? (
                  <img src={l.photo} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                ) : (
                  '[Photo]'
                )}
              </div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{l.title.toUpperCase()}</p>
              <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', marginBottom: '8px', transition: 'color 0.3s ease' }}>{l.name}</h3>
              <p style={{ fontSize: '13px', color: colors.red, fontWeight: '700', transition: 'color 0.3s ease' }}>View bio →</p>
            </div>
          ))}
        </div>
      </section>
      <section className="animate-fade-in" style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Come see it for yourself.</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>Tours available Monday through Friday.</p>
          </div>
          <button className="btn-animated" onClick={() => goTo('contact')} style={{ backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>BOOK A TOUR</button>
        </div>
      </section>
    </>
  );

  const StudiosPage = () => (
    <>
      <SubNav />
      <Breadcrumbs />
      <HeroSection tag="BASE STUDIOS" title="Where production lives." subtitle="2,000 square feet of production-ready studio space with natural light and full blackout capability." buttonText="CHECK AVAILABILITY" buttonAction={() => goTo('contact')} secondaryButton={{ text: 'VIRTUAL TOUR', action: () => setShowTour(true) }} heroImage="Studio Interior" />
      {showTour && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px' : '40px' }}>
          <div style={{ maxWidth: '900px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red }}>VIRTUAL TOUR • {tourSlide + 1} / {sortedTourSlides.length}</p>
              <span style={{ color: colors.cream, cursor: 'pointer', fontSize: '24px' }} onClick={() => setShowTour(false)}>✕</span>
            </div>
            <div style={{ backgroundColor: colors.midGray, height: isMobile ? '250px' : '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', marginBottom: '20px', overflow: 'hidden' }}>
              {sortedTourSlides[tourSlide]?.image ? (
                <img src={sortedTourSlides[tourSlide].image} alt={sortedTourSlides[tourSlide].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                `[360° View: ${sortedTourSlides[tourSlide]?.title}]`
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: colors.cream }}>{sortedTourSlides[tourSlide]?.title}</h3>
                <p style={{ fontSize: '14px', color: colors.gray }}>{sortedTourSlides[tourSlide]?.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                <button onClick={() => setTourSlide(Math.max(0, tourSlide - 1))} style={{ backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '12px 24px', fontSize: '12px', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>← PREV</button>
                <button onClick={() => setTourSlide(Math.min(sortedTourSlides.length - 1, tourSlide + 1))} style={{ background: redGradient, color: '#fff', border: 'none', padding: '12px 24px', fontSize: '12px', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>NEXT →</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ClientLogoMarquee />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', backgroundColor: colors.darkGray }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>AMENITIES</p>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>No nickel-and-diming.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '2px' }}>
          {[...studioAmenities].sort((a, b) => a.order - b.order).map((item) => (
            <div key={item.id} style={{ backgroundColor: colors.bg, padding: isMobile ? '16px' : '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: colors.red }}>✓</span>
              <span style={{ fontSize: isMobile ? '12px' : '13px' }}>{item.name}</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Ready to book?</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>Check availability or schedule a walkthrough.</p>
          </div>
          <button onClick={() => goTo('contact')} style={{ backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>BOOK A TOUR</button>
        </div>
      </section>
    </>
  );

  const ProductionPage = () => (
    <>
      <SubNav />
      <Breadcrumbs />
      <HeroSection tag="BASE PRODUCTION SERVICES" title="From concept to delivery." subtitle="Full-service production support. Pre-production, production, post-production, and fabrication." buttonText="START A PROJECT" buttonAction={() => goTo('contact')} heroImage="Production in Progress" />
      <ClientLogoMarquee />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>OUR SERVICES</p>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>Everything you need, under one roof.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {groupedProductionServices.map((cat, i) => (
            <div key={i} style={{ backgroundColor: colors.darkGray }}>
              <div style={{ padding: isMobile ? '24px 20px' : '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '12px' }}>{cat.title}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {cat.services.map((s, j) => (
                      <span key={j} onClick={(e) => handleServiceTagClick(i, j, e)} style={{ fontSize: isMobile ? '11px' : '12px', padding: isMobile ? '6px 10px' : '8px 14px', backgroundColor: (expandedService === i && selectedServiceItem === j) ? colors.red : colors.bg, color: (expandedService === i && selectedServiceItem === j) ? '#fff' : colors.cream, cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: '2px' }}>{s.name}</span>
                    ))}
                  </div>
                </div>
                <span onClick={() => { if (expandedService === i) { setExpandedService(null); setSelectedServiceItem(null); } else { setExpandedService(i); setSelectedServiceItem(0); }}} style={{ fontSize: '24px', color: colors.red, transform: expandedService === i ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, cursor: 'pointer', padding: '4px' }}>+</span>
              </div>
              {expandedService === i && (
                <div style={{ padding: isMobile ? '0 20px 24px' : '0 32px 32px', borderTop: '1px solid #2A2A2A' }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', paddingTop: '24px' }}>
                    <div style={{ width: isMobile ? '100%' : '250px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? '8px' : '0' }}>
                      {cat.services.map((s, j) => (
                        <div key={j} onClick={() => setSelectedServiceItem(j)} style={{ padding: isMobile ? '10px 14px' : '12px 16px', cursor: 'pointer', backgroundColor: selectedServiceItem === j ? colors.midGray : (isMobile ? colors.bg : 'transparent'), borderLeft: isMobile ? 'none' : (selectedServiceItem === j ? '2px solid ' + colors.red : '2px solid transparent'), marginBottom: isMobile ? '0' : '4px', borderRadius: isMobile ? '4px' : '0', transition: 'all 0.15s ease' }}>
                          <p style={{ fontSize: '13px', color: selectedServiceItem === j ? colors.cream : colors.gray }}>{s.name}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ flex: 1 }}>
                      {selectedServiceItem !== null && (
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: colors.cream }}>{cat.services[selectedServiceItem].name}</h4>
                          <div style={{ fontSize: '14px', color: colors.gray, lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: cat.services[selectedServiceItem].copy }} />
                          {cat.services[selectedServiceItem].link && (
                            <button onClick={() => goTo(cat.services[selectedServiceItem].link)} style={{ marginTop: '24px', background: redGradient, color: '#fff', border: 'none', padding: '12px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>LEARN MORE →</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', backgroundColor: colors.darkGray }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: '32px', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>RECENT WORK</p>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700' }}>Selected projects</h2>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', flexWrap: 'wrap' }}>
            {['ALL', 'COMMERCIAL', 'MUSIC VIDEO', 'BRANDED', 'EDITORIAL'].map((c, i) => (
              <span key={i} onClick={() => setActivePortfolioCategory(c)} style={{ fontSize: '11px', color: activePortfolioCategory === c ? colors.red : colors.gray, cursor: 'pointer', paddingBottom: '4px', borderBottom: activePortfolioCategory === c ? '2px solid ' + colors.red : '2px solid transparent' }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '2px' }}>
          {portfolioItems.filter(item => activePortfolioCategory === 'ALL' || item.category === activePortfolioCategory).map((item, i) => (
            <div key={item.id} style={{ backgroundColor: colors.bg, cursor: 'pointer' }} onClick={() => { setSelectedPortfolioIndex(i); setShowPortfolioModal(true); }}>
              <div style={{ backgroundColor: colors.midGray, height: isMobile ? '180px' : '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', overflow: 'hidden' }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '[Thumbnail]'
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{item.category}</p>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: colors.gray }}>{item.client}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Have a project in mind?</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>Let's talk about what you're building.</p>
          </div>
          <button onClick={() => goTo('contact')} style={{ backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>START A PROJECT</button>
        </div>
      </section>
    </>
  );

  const DronePage = () => (
    <>
      <SubNav />
      <Breadcrumbs />
      <HeroSection tag="DRONE & AERIAL CINEMATOGRAPHY" title="Elevated perspectives for every production." subtitle="FAA Part 107 certified pilots, professional-grade equipment, and creative expertise." buttonText="GET A QUOTE" buttonAction={() => goTo('contact')} heroImage="Aerial Drone Shot" />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>CAPABILITIES</p>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>Professional aerial services.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '2px' }}>
          {DRONE_CAPABILITIES.map((s, i) => (
            <div key={i} style={{ backgroundColor: colors.darkGray, padding: isMobile ? '32px 24px' : '40px' }}>
              <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', marginBottom: '16px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: colors.gray, lineHeight: '1.7' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', backgroundColor: colors.darkGray }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: '32px', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>AERIAL PORTFOLIO</p>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700' }}>Recent aerial work</h2>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', flexWrap: 'wrap' }}>
            {['ALL', 'COMMERCIAL', 'MUSIC VIDEO', 'REAL ESTATE', 'LIVE EVENT', 'FPV'].map((c, i) => (
              <span key={i} onClick={() => setActiveDroneCategory(c)} style={{ fontSize: '11px', color: activeDroneCategory === c ? colors.red : colors.gray, cursor: 'pointer', paddingBottom: '4px', borderBottom: activeDroneCategory === c ? '2px solid ' + colors.red : '2px solid transparent' }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '2px' }}>
          {dronePortfolioItems.filter(item => activeDroneCategory === 'ALL' || item.category === activeDroneCategory).map((item, i) => (
            <div key={item.id} style={{ backgroundColor: colors.bg, cursor: 'pointer' }} onClick={() => { setSelectedDronePortfolioIndex(i); setShowDronePortfolioModal(true); }}>
              <div style={{ backgroundColor: colors.midGray, height: isMobile ? '180px' : '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', overflow: 'hidden' }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '[Aerial Shot]'
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{item.category}</p>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: colors.gray }}>{item.client}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>EQUIPMENT</p>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>Professional-grade gear.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
          {DRONE_EQUIPMENT.map((e, i) => (
            <div key={i} style={{ backgroundColor: colors.darkGray, padding: isMobile ? '24px' : '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{e.title}</h3>
              <p style={{ fontSize: '14px', color: colors.gray }}>{e.specs}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Ready to fly?</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>Get a quote for your aerial cinematography needs.</p>
          </div>
          <button onClick={() => goTo('contact')} style={{ backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>GET A QUOTE</button>
        </div>
      </section>
    </>
  );

  const ConnectPage = () => (
    <>
      <SubNav />
      <Breadcrumbs />
      <HeroSection tag="BASE CONNECT" title="Work. Create. Connect." subtitle="Physical workspace for creatives and access to NYC's premier network of vetted creative professionals." heroImage="Coworking Space" />
      <section style={{ padding: isMobile ? '0 20px 60px' : '0 48px 80px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>WORKSPACE</p>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '24px' }}>Your home base in NYC.</h2>
        <p style={{ fontSize: '16px', color: colors.gray, lineHeight: '1.7', marginBottom: isMobile ? '32px' : '48px', maxWidth: '700px' }}>More than just a desk—it's your creative headquarters in Chinatown. Work alongside fellow creatives, access professional amenities, and be part of a community that understands production life.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '2px' }}>
          <div style={{ backgroundColor: colors.darkGray, padding: isMobile ? '32px 24px' : '48px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '8px' }}>COWORKING SPACE</p>
            <div style={{ marginBottom: '24px' }}><span style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '700' }}>$800</span><span style={{ fontSize: '16px', color: colors.gray }}>/month</span></div>
            <p style={{ fontSize: '14px', color: colors.gray, marginBottom: '24px' }}>Dedicated desk in our shared creative workspace.</p>
            <div style={{ flex: 1 }}>
              {coworkingFeatures.map((f) => (
                <p key={f.id} style={{ fontSize: '13px', color: '#B0B0B0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: colors.red }}>✓</span>{f.featureName}</p>
              ))}
            </div>
            <button onClick={() => goTo('contact')} style={{ marginTop: '24px', backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '16px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>INQUIRE</button>
          </div>
          <div style={{ background: redGradient, padding: isMobile ? '32px 24px' : '48px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>PRIVATE OFFICE</p>
            <div style={{ marginBottom: '24px' }}><span style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '700', color: '#fff' }}>Custom</span></div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '24px' }}>Private office space for teams of 2-6.</p>
            <div style={{ flex: 1 }}>
              {privateOfficeFeatures.map((f) => (
                <p key={f.id} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>✓</span>{f.featureName}</p>
              ))}
            </div>
            <button onClick={() => goTo('contact')} style={{ marginTop: '24px', backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '16px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>INQUIRE</button>
          </div>
        </div>
      </section>
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', backgroundColor: colors.darkGray }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>TALENT NETWORK</p>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '24px' }}>NYC's vetted creative professionals.</h2>
        <p style={{ fontSize: '16px', color: colors.gray, lineHeight: '1.7', marginBottom: isMobile ? '32px' : '48px', maxWidth: '700px' }}>Access our curated network of photographers, videographers, directors, producers, editors, and more. Every member is vetted for quality and professionalism.</p>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
          <button onClick={() => goTo('membership')} style={{ background: redGradient, color: '#fff', border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>APPLY TO JOIN</button>
          <button onClick={() => goTo('contact')} style={{ backgroundColor: 'transparent', color: colors.cream, border: '1px solid #2A2A2A', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>HIRE FROM NETWORK</button>
        </div>
      </section>
    </>
  );

  const blogCategories = ['ALL', 'INDUSTRY NEWS', 'NYC CULTURE & EVENTS', 'SPOTLIGHTS'];

  const BlogPage = () => (
    <>
      <Breadcrumbs />
      <section style={{ padding: isMobile ? '60px 20px 32px' : '80px 48px 40px' }}>
        <h1 className="animate-fade-in-up" style={{ fontSize: isMobile ? '36px' : '56px', fontWeight: '700', margin: '0 0 16px 0' }}>The Dailies</h1>
        <p className="animate-fade-in-up" style={{ fontSize: isMobile ? '16px' : '18px', color: colors.gray, animationDelay: '0.1s' }}>Industry news, NYC culture, and creator spotlights.</p>
      </section>
      <section className="animate-fade-in-up" style={{ padding: isMobile ? '0 20px 32px' : '0 48px 48px', display: 'flex', gap: isMobile ? '16px' : '24px', flexWrap: 'wrap', animationDelay: '0.2s' }}>
        {blogCategories.map((c, i) => (
          <span 
            key={i} 
            className="tag-hover"
            onClick={() => setActiveFilter(c)} 
            style={{ 
              fontSize: '12px', 
              color: activeFilter === c ? colors.red : colors.gray, 
              cursor: 'pointer', 
              paddingBottom: '8px', 
              borderBottom: activeFilter === c ? '2px solid ' + colors.red : '2px solid transparent',
              transition: 'color 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => { if (activeFilter !== c) e.target.style.color = colors.cream; }}
            onMouseLeave={(e) => { if (activeFilter !== c) e.target.style.color = colors.gray; }}
          >{c}</span>
        ))}
      </section>
      <section style={{ padding: isMobile ? '0 20px 60px' : '0 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '24px' }}>
          {blogPosts.filter(p => activeFilter === 'ALL' || p.category === activeFilter).map((p, i) => (
            <article 
              key={p.id} 
              className="hover-lift animate-fade-in-up img-hover-zoom"
              onClick={() => goToArticle(p)} 
              style={{ cursor: 'pointer', animationDelay: `${0.1 + (i % 6) * 0.05}s` }}
            >
              <div style={{ backgroundColor: colors.midGray, height: isMobile ? '180px' : '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A4A4A', marginBottom: '20px', overflow: 'hidden', borderRadius: '2px' }}>
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                ) : (
                  '[Thumbnail]'
                )}
              </div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '12px' }}>{p.category}</p>
              <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', marginBottom: '12px', transition: 'color 0.3s ease' }}>{p.title}</h3>
              <p style={{ fontSize: '12px', color: '#6A6A6A' }}>{p.date}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );

  // ============================================
  // BLOG ARTICLE PAGE TEMPLATE
  // ============================================

  const BlogArticlePage = () => {
    if (!selectedArticle) {
      goTo('blog');
      return null;
    }

    // Get related articles (same category, excluding current)
    const relatedArticles = blogPosts
      .filter(p => p.category === selectedArticle.category && p.id !== selectedArticle.id)
      .slice(0, 3);

    // If not enough related articles in same category, fill with other recent articles
    const additionalArticles = relatedArticles.length < 3 
      ? blogPosts.filter(p => p.id !== selectedArticle.id && !relatedArticles.find(r => r.id === p.id)).slice(0, 3 - relatedArticles.length)
      : [];

    const allRelated = [...relatedArticles, ...additionalArticles];

    return (
      <>
        <Breadcrumbs />
        
        {/* Article Header */}
        <article style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '40px 20px' : '60px 48px' }}>
          {/* Category & Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span 
              onClick={() => { setActiveFilter(selectedArticle.category); goTo('blog'); }}
              style={{ 
                fontSize: '11px', 
                letterSpacing: '2px', 
                color: colors.red, 
                cursor: 'pointer',
                padding: '6px 12px',
                backgroundColor: 'rgba(237, 28, 36, 0.1)',
                borderRadius: '2px'
              }}
            >
              {selectedArticle.category}
            </span>
            <span style={{ fontSize: '13px', color: colors.gray }}>{selectedArticle.date}</span>
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: isMobile ? '32px' : '48px', 
            fontWeight: '700', 
            lineHeight: '1.15', 
            letterSpacing: '-1px',
            marginBottom: '24px' 
          }}>
            {selectedArticle.title}
          </h1>

          {/* Excerpt */}
          {selectedArticle.excerpt && (
            <p style={{ 
              fontSize: isMobile ? '18px' : '20px', 
              color: colors.gray, 
              lineHeight: '1.6', 
              marginBottom: '32px',
              fontStyle: 'italic'
            }}>
              {selectedArticle.excerpt}
            </p>
          )}

          {/* Author */}
          {selectedArticle.author && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              paddingBottom: '32px',
              borderBottom: '1px solid #1A1A1A',
              marginBottom: '40px'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: colors.midGray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4A4A4A',
                fontSize: '12px',
                overflow: 'hidden'
              }}>
                {selectedArticle.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{selectedArticle.author}</p>
              </div>
            </div>
          )}

          {/* Featured Image */}
          <div style={{ 
            backgroundColor: colors.midGray, 
            height: isMobile ? '220px' : '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#4A4A4A',
            marginBottom: '48px',
            overflow: 'hidden'
          }}>
            {selectedArticle.thumbnail ? (
              <img src={selectedArticle.thumbnail} alt={selectedArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '[Featured Image]'
            )}
          </div>

          {/* Article Content - Renders rich text HTML from Webflow CMS */}
          {selectedArticle.content ? (
            <div 
              style={{ 
                fontSize: isMobile ? '16px' : '17px', 
                lineHeight: '1.8', 
                color: colors.cream 
              }}
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              className="article-content"
            />
          ) : (
            <div style={{ fontSize: isMobile ? '16px' : '17px', lineHeight: '1.8', color: colors.gray }}>
              <p>Article content will be displayed here when loaded from Webflow CMS.</p>
            </div>
          )}

          {/* Share / Back */}
          <div style={{ 
            marginTop: '48px', 
            paddingTop: '32px',
            borderTop: '1px solid #1A1A1A',
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <button 
              onClick={() => goTo('blog')}
              style={{ 
                backgroundColor: 'transparent', 
                color: colors.cream, 
                border: '1px solid #2A2A2A', 
                padding: '12px 24px', 
                fontSize: '12px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← BACK TO DAILIES
            </button>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: colors.gray, cursor: 'pointer' }}>Share on Twitter</span>
              <span style={{ fontSize: '12px', color: colors.gray, cursor: 'pointer' }}>Share on LinkedIn</span>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {allRelated.length > 0 && (
          <section style={{ 
            padding: isMobile ? '60px 20px' : '80px 48px', 
            backgroundColor: colors.darkGray 
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>KEEP READING</p>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>Related articles</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
              gap: '24px' 
            }}>
              {allRelated.map((p) => (
                <article key={p.id} onClick={() => goToArticle(p)} style={{ cursor: 'pointer' }}>
                  <div style={{ 
                    backgroundColor: colors.midGray, 
                    height: isMobile ? '160px' : '180px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#4A4A4A', 
                    marginBottom: '20px', 
                    overflow: 'hidden' 
                  }}>
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '[Thumbnail]'
                    )}
                  </div>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '12px' }}>{p.category}</p>
                  <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', marginBottom: '12px' }}>{p.title}</h3>
                  <p style={{ fontSize: '12px', color: '#6A6A6A' }}>{p.date}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div>
              <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Stay in the loop.</h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>Get The Dailies delivered to your inbox.</p>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              width: isMobile ? '100%' : 'auto'
            }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  padding: '16px 20px', 
                  fontSize: '14px', 
                  color: '#fff', 
                  outline: 'none',
                  width: isMobile ? '100%' : '280px',
                  boxSizing: 'border-box'
                }} 
              />
              <button style={{ 
                backgroundColor: colors.bg, 
                color: colors.cream, 
                border: 'none', 
                padding: '16px 32px', 
                fontSize: '13px', 
                fontWeight: '700', 
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                SUBSCRIBE
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  // Article content styles for Webflow CMS rich text
  const ArticleStyles = () => (
    <style>{`
      .article-content h2 {
        font-size: ${isMobile ? '24px' : '28px'};
        font-weight: 700;
        margin: 48px 0 24px 0;
        color: ${colors.cream};
      }
      .article-content h3 {
        font-size: ${isMobile ? '20px' : '22px'};
        font-weight: 700;
        margin: 36px 0 16px 0;
        color: ${colors.cream};
      }
      .article-content p {
        margin-bottom: 24px;
        color: ${colors.gray};
      }
      .article-content p:first-child {
        color: ${colors.cream};
      }
      .article-content em {
        font-style: italic;
        color: ${colors.cream};
      }
      .article-content strong {
        font-weight: 600;
        color: ${colors.cream};
      }
      .article-content ul, .article-content ol {
        margin: 24px 0;
        padding-left: 24px;
        color: ${colors.gray};
      }
      .article-content li {
        margin-bottom: 12px;
      }
      .article-content blockquote {
        border-left: 3px solid ${colors.red};
        padding-left: 24px;
        margin: 32px 0;
        font-style: italic;
        color: ${colors.cream};
      }
      .article-content a {
        color: ${colors.red};
        text-decoration: none;
      }
      .article-content a:hover {
        text-decoration: underline;
      }
      .article-content img {
        max-width: 100%;
        height: auto;
        margin: 32px 0;
      }
      .article-content figure {
        margin: 32px 0;
      }
      .article-content figcaption {
        font-size: 13px;
        color: ${colors.gray};
        margin-top: 8px;
        text-align: center;
      }
    `}</style>
  );

  const ContactPage = () => {
    const [contactFormData, setContactFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      message: '',
      reason: selectedReason,
    });
    const [isContactSubmitting, setIsContactSubmitting] = useState(false);
    const [contactSubmitStatus, setContactSubmitStatus] = useState(null);

    useEffect(() => {
      AssemblyService.initFormTracking('contact-form');
    }, []);

    const handleContactSubmit = async (e) => {
      e.preventDefault();
      setIsContactSubmitting(true);
      setContactSubmitStatus(null);

      const result = await AssemblyService.submitForm({
        ...contactFormData,
        reason: selectedReason,
      }, 'contact');
      
      setIsContactSubmitting(false);
      setContactSubmitStatus(result.success ? 'success' : 'error');

      if (result.success) {
        setContactFormData({ firstName: '', lastName: '', email: '', message: '', reason: '' });
        setSelectedReason('');
        setTimeout(() => setContactSubmitStatus(null), 5000);
      }
    };

    return (
      <>
        <Breadcrumbs />
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: isMobile ? 'auto' : '600px' }}>
          <div style={{ flex: 1, padding: isMobile ? '60px 20px' : '80px 48px', borderRight: isMobile ? 'none' : '1px solid #1A1A1A', borderBottom: isMobile ? '1px solid #1A1A1A' : 'none' }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '24px' }}>CONTACT BASE</p>
            <h1 style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '700', margin: '0 0 32px 0' }}>Let's talk.</h1>
            <p style={{ fontSize: '16px', color: colors.gray, marginBottom: isMobile ? '32px' : '48px' }}>Whether you're looking to book studio time, start a project, or just want to see the space, we'd love to hear from you.</p>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '8px' }}>EMAIL</p>
              <p style={{ fontSize: '16px' }}>hello@wearebase.nyc</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '8px' }}>PHONE</p>
              <p style={{ fontSize: '16px' }}>(212) 555-1234</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '8px' }}>LOCATION</p>
              <p style={{ fontSize: '16px' }}>120 East Broadway<br/>New York, NY 10002</p>
            </div>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '40px 20px 60px' : '80px 48px', backgroundColor: colors.darkGray }}>
            <form onSubmit={handleContactSubmit} data-assembly-form="contact" data-assembly-form-id="base-nyc-contact">
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>I'M REACHING OUT ABOUT</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CONTACT_REASONS.map((r, i) => (
                    <button 
                      key={i} 
                      type="button"
                      onClick={() => {
                        setSelectedReason(r);
                        AssemblyService.trackFieldInteraction('contact-form', 'reason', 'change');
                      }} 
                      style={{ background: selectedReason === r ? redGradient : 'transparent', color: selectedReason === r ? '#fff' : colors.cream, border: selectedReason === r ? 'none' : '1px solid #2A2A2A', padding: isMobile ? '10px 16px' : '12px 20px', fontSize: isMobile ? '12px' : '13px', cursor: 'pointer' }}
                    >{r}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>FIRST NAME</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={contactFormData.firstName}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    onFocus={() => AssemblyService.trackFieldInteraction('contact-form', 'firstName', 'focus')}
                    onBlur={() => AssemblyService.trackFieldInteraction('contact-form', 'firstName', 'blur')}
                    required
                    data-assembly-field="firstName"
                    style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>LAST NAME</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={contactFormData.lastName}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    onFocus={() => AssemblyService.trackFieldInteraction('contact-form', 'lastName', 'focus')}
                    onBlur={() => AssemblyService.trackFieldInteraction('contact-form', 'lastName', 'blur')}
                    required
                    data-assembly-field="lastName"
                    style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>EMAIL</label>
                <input 
                  type="email" 
                  name="email"
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('contact-form', 'email', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('contact-form', 'email', 'blur')}
                  required
                  data-assembly-field="email"
                  style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>TELL US MORE</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData(prev => ({ ...prev, message: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('contact-form', 'message', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('contact-form', 'message', 'blur')}
                  placeholder="What are you working on?" 
                  data-assembly-field="message"
                  style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', resize: 'vertical', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                type="submit" 
                disabled={isContactSubmitting}
                style={{ width: '100%', background: isContactSubmitting ? colors.gray : redGradient, color: '#fff', border: 'none', padding: '20px', fontSize: '13px', fontWeight: '700', cursor: isContactSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isContactSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
              {contactSubmitStatus === 'success' && (
                <p style={{ fontSize: '14px', color: '#4CAF50', marginTop: '16px', textAlign: 'center' }}>Message sent successfully! We'll be in touch soon.</p>
              )}
              {contactSubmitStatus === 'error' && (
                <p style={{ fontSize: '14px', color: colors.red, marginTop: '16px', textAlign: 'center' }}>Something went wrong. Please try again or email us directly.</p>
              )}
              <p style={{ fontSize: '12px', color: '#6A6A6A', marginTop: '16px', textAlign: 'center' }}>We typically respond within 24 hours.</p>
            </form>
          </div>
        </div>
      </>
    );
  };

  const LoginPage = () => {
    const [loginFormData, setLoginFormData] = useState({ email: '', password: '' });
    const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
    const [loginError, setLoginError] = useState(null);

    useEffect(() => {
      AssemblyService.initFormTracking('login-form');
    }, []);

    const handleLoginSubmit = async (e) => {
      e.preventDefault();
      setIsLoginSubmitting(true);
      setLoginError(null);

      const result = await AssemblyService.submitForm(loginFormData, 'login');
      
      setIsLoginSubmitting(false);
      if (!result.success) {
        setLoginError('Invalid credentials. Please try again.');
      }
    };

    return (
      <>
        <Breadcrumbs />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '60px 20px' : '80px 48px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Client Login</h1>
            <form onSubmit={handleLoginSubmit} data-assembly-form="login" data-assembly-form-id="base-nyc-login">
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>EMAIL</label>
                <input 
                  type="email" 
                  name="email"
                  value={loginFormData.email}
                  onChange={(e) => setLoginFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('login-form', 'email', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('login-form', 'email', 'blur')}
                  required
                  data-assembly-field="email"
                  style={{ width: '100%', backgroundColor: colors.darkGray, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>PASSWORD</label>
                <input 
                  type="password" 
                  name="password"
                  value={loginFormData.password}
                  onChange={(e) => setLoginFormData(prev => ({ ...prev, password: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('login-form', 'password', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('login-form', 'password', 'blur')}
                  required
                  data-assembly-field="password"
                  style={{ width: '100%', backgroundColor: colors.darkGray, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              {loginError && (
                <p style={{ fontSize: '14px', color: colors.red, marginBottom: '16px', textAlign: 'center' }}>{loginError}</p>
              )}
              <button 
                type="submit"
                disabled={isLoginSubmitting}
                style={{ width: '100%', background: isLoginSubmitting ? colors.gray : redGradient, color: '#fff', border: 'none', padding: '20px', fontSize: '13px', fontWeight: '700', cursor: isLoginSubmitting ? 'not-allowed' : 'pointer', marginBottom: '16px' }}
              >
                {isLoginSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
            <p style={{ fontSize: '13px', color: colors.gray, textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowPasswordReset(true)}>Forgot password?</p>
          </div>
        </div>
      </>
    );
  };

  const MembershipPage = () => {
    const [membershipFormData, setMembershipFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      portfolio: '',
      specialty: '',
      message: '',
    });
    const [isMembershipSubmitting, setIsMembershipSubmitting] = useState(false);
    const [membershipSubmitStatus, setMembershipSubmitStatus] = useState(null);

    useEffect(() => {
      AssemblyService.initFormTracking('membership-form');
    }, []);

    const handleMembershipSubmit = async (e) => {
      e.preventDefault();
      setIsMembershipSubmitting(true);
      setMembershipSubmitStatus(null);

      const result = await AssemblyService.submitForm(membershipFormData, 'membership');
      
      setIsMembershipSubmitting(false);
      setMembershipSubmitStatus(result.success ? 'success' : 'error');

      if (result.success) {
        setMembershipFormData({ firstName: '', lastName: '', email: '', portfolio: '', specialty: '', message: '' });
        setTimeout(() => setMembershipSubmitStatus(null), 5000);
      }
    };

    return (
      <>
        <Breadcrumbs />
        <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', maxWidth: '800px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '24px' }}>JOIN BASE CONNECT</p>
          <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '700', marginBottom: '24px' }}>Membership Application</h1>
          <p style={{ fontSize: '16px', color: colors.gray, lineHeight: '1.7', marginBottom: '48px' }}>Base Connect is a curated network. All applications are reviewed by our team to ensure quality and fit.</p>
          <div style={{ backgroundColor: colors.darkGray, padding: isMobile ? '32px 24px' : '48px' }}>
            <form onSubmit={handleMembershipSubmit} data-assembly-form="membership" data-assembly-form-id="base-nyc-membership">
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>FIRST NAME</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={membershipFormData.firstName}
                    onChange={(e) => setMembershipFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    onFocus={() => AssemblyService.trackFieldInteraction('membership-form', 'firstName', 'focus')}
                    onBlur={() => AssemblyService.trackFieldInteraction('membership-form', 'firstName', 'blur')}
                    required
                    data-assembly-field="firstName"
                    style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>LAST NAME</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={membershipFormData.lastName}
                    onChange={(e) => setMembershipFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    onFocus={() => AssemblyService.trackFieldInteraction('membership-form', 'lastName', 'focus')}
                    onBlur={() => AssemblyService.trackFieldInteraction('membership-form', 'lastName', 'blur')}
                    required
                    data-assembly-field="lastName"
                    style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>EMAIL</label>
                <input 
                  type="email" 
                  name="email"
                  value={membershipFormData.email}
                  onChange={(e) => setMembershipFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('membership-form', 'email', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('membership-form', 'email', 'blur')}
                  required
                  data-assembly-field="email"
                  style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>PORTFOLIO / WEBSITE</label>
                <input 
                  type="url" 
                  name="portfolio"
                  value={membershipFormData.portfolio}
                  onChange={(e) => setMembershipFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('membership-form', 'portfolio', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('membership-form', 'portfolio', 'blur')}
                  placeholder="https://"
                  data-assembly-field="portfolio"
                  style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>PRIMARY SPECIALTY</label>
                <select 
                  name="specialty"
                  value={membershipFormData.specialty}
                  onChange={(e) => setMembershipFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('membership-form', 'specialty', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('membership-form', 'specialty', 'blur')}
                  required
                  data-assembly-field="specialty"
                  style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">Select your specialty</option>
                  <option value="director">Director</option>
                  <option value="producer">Producer</option>
                  <option value="dp">Director of Photography</option>
                  <option value="editor">Editor</option>
                  <option value="colorist">Colorist</option>
                  <option value="sound">Sound Designer / Mixer</option>
                  <option value="gaffer">Gaffer / Lighting</option>
                  <option value="grip">Grip</option>
                  <option value="art">Art Director / Production Designer</option>
                  <option value="wardrobe">Wardrobe / Styling</option>
                  <option value="makeup">Hair & Makeup</option>
                  <option value="motion">Motion Graphics / Animation</option>
                  <option value="vfx">VFX Artist</option>
                  <option value="photographer">Photographer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: colors.gray, marginBottom: '12px' }}>TELL US ABOUT YOURSELF</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={membershipFormData.message}
                  onChange={(e) => setMembershipFormData(prev => ({ ...prev, message: e.target.value }))}
                  onFocus={() => AssemblyService.trackFieldInteraction('membership-form', 'message', 'focus')}
                  onBlur={() => AssemblyService.trackFieldInteraction('membership-form', 'message', 'blur')}
                  placeholder="What are you working on? What are you looking for in a creative community?" 
                  data-assembly-field="message"
                  style={{ width: '100%', backgroundColor: colors.bg, border: '1px solid #2A2A2A', padding: '16px', fontSize: '14px', color: colors.cream, outline: 'none', resize: 'vertical', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                type="submit"
                disabled={isMembershipSubmitting}
                style={{ width: '100%', background: isMembershipSubmitting ? colors.gray : redGradient, color: '#fff', border: 'none', padding: '20px', fontSize: '13px', fontWeight: '700', cursor: isMembershipSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isMembershipSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
              {membershipSubmitStatus === 'success' && (
                <p style={{ fontSize: '14px', color: '#4CAF50', marginTop: '16px', textAlign: 'center' }}>Application submitted! We'll review and get back to you within 48 hours.</p>
              )}
              {membershipSubmitStatus === 'error' && (
                <p style={{ fontSize: '14px', color: colors.red, marginTop: '16px', textAlign: 'center' }}>Something went wrong. Please try again or email us at hello@wearebase.nyc</p>
              )}
            </form>
          </div>
        </section>
      </>
    );
  };

  const PersonaPage = ({ tag, title, subtitle, heroImage, solutions, ctaTitle, ctaSubtitle }) => (
    <>
      <Breadcrumbs />
      <HeroSection tag={tag} title={title} subtitle={subtitle} buttonText="GET STARTED" buttonAction={() => goTo('contact')} heroImage={heroImage} />
      <ClientLogoMarquee />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', backgroundColor: colors.darkGray }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '16px' }}>SOLUTIONS</p>
        <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: isMobile ? '32px' : '48px' }}>How Base works for you</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '2px' }}>
          {solutions.map((s, i) => (
            <div 
              key={i}
              className="industry-card"
              onClick={() => goTo(s.link)} 
              style={{ 
                flex: 1, 
                background: colors.bg, 
                padding: isMobile ? '32px 24px' : '40px'
              }}
            >
              <p className="card-subtitle" style={{ fontSize: '11px', letterSpacing: '2px', color: colors.red, marginBottom: '8px' }}>{s.sub}</p>
              <h3 className="card-title" style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', marginBottom: '16px', color: colors.cream }}>{s.title}</h3>
              <p className="card-desc" style={{ fontSize: '14px', color: colors.gray, marginBottom: '24px', lineHeight: '1.7' }}>{s.desc}</p>
              <span className="card-cta" style={{ fontSize: '13px', color: colors.red, fontWeight: '700' }}>Learn more →</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: isMobile ? '48px 20px' : '80px 48px', background: redGradient }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>{ctaTitle}</h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>{ctaSubtitle}</p>
          </div>
          <button className="btn-animated" onClick={() => goTo('contact')} style={{ backgroundColor: colors.bg, color: colors.cream, border: 'none', padding: '20px 40px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>CONTACT US</button>
        </div>
      </section>
    </>
  );

  const AgenciesPage = () => <PersonaPage tag="FOR AGENCIES" title="Your production partner in NYC." subtitle="Streamline your NYC productions with dedicated infrastructure, trusted crews, and flexible workspace." heroImage="Agency Production" solutions={[{ sub: 'BASE STUDIOS', title: 'Always-on studio access', desc: 'Reserve recurring studio time for client shoots.', link: 'studios' }, { sub: 'BASE PRODUCTION', title: 'Full-service support', desc: 'Scale up or down as projects demand.', link: 'production' }, { sub: 'BASE CONNECT', title: 'Vetted freelance talent', desc: 'Access our curated network of professionals.', link: 'connect' }]} ctaTitle="Let's discuss your needs." ctaSubtitle="We work with agencies of all sizes." />;
  const EntertainmentPage = () => <PersonaPage tag="FOR ENTERTAINMENT" title="Production infrastructure for film & TV." subtitle="From indie films to major productions, Base provides the space and support you need." heroImage="Film Production" solutions={[{ sub: 'BASE STUDIOS', title: 'Flexible stage space', desc: 'Day rates, weekly holds, and custom configurations.', link: 'studios' }, { sub: 'BASE PRODUCTION', title: 'Union-friendly crews', desc: 'IATSE, DGA, SAG-AFTRA compliant workflows.', link: 'production' }, { sub: 'BASE CONNECT', title: 'Vetted production talent', desc: 'Access our curated network of DPs, gaffers, grips, and crew for any scale production.', link: 'connect' }]} ctaTitle="Tour the facility." ctaSubtitle="See how Base supports productions." />;
  const FashionPage = () => <PersonaPage tag="FOR FASHION BRANDS" title="Studio space built for fashion." subtitle="Natural light, blackout capability, and the amenities fashion productions demand." heroImage="Fashion Shoot" solutions={[{ sub: 'BASE STUDIOS', title: 'Editorial-ready space', desc: 'South-facing windows, cyclorama wall, and more.', link: 'studios' }, { sub: 'BASE PRODUCTION', title: 'Full styling support', desc: 'Hair, makeup, wardrobe, and photo assistance.', link: 'production' }, { sub: 'BASE CONNECT', title: 'Talent network', desc: 'Models, photographers, and stylists.', link: 'connect' }]} ctaTitle="See the space." ctaSubtitle="Book a tour or virtual walkthrough." />;
  const CreativesPage = () => <PersonaPage tag="FOR CREATIVES" title="Agency-level infrastructure. Accessible rates." subtitle="Independent creators and small teams deserve professional production support too." heroImage="Creative Production" solutions={[{ sub: 'BASE STUDIOS', title: 'Professional space, fair pricing', desc: 'Half-day and hourly rates that work.', link: 'studios' }, { sub: 'BASE PRODUCTION', title: 'Support when you need it', desc: 'Book individual services à la carte.', link: 'production' }, { sub: 'BASE CONNECT', title: 'Join the community', desc: 'Coworking alongside other creatives.', link: 'connect' }]} ctaTitle="Ready to level up?" ctaSubtitle="Tour the space and see what's possible." />;

  // ============================================
  // PRIVACY PAGE
  // ============================================

  const PrivacyPage = () => (
    <>
      <Breadcrumbs />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', maxWidth: '800px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '24px' }}>LEGAL</p>
        <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '700', marginBottom: '16px' }}>Privacy Policy</h1>
        <p style={{ fontSize: '14px', color: colors.gray, marginBottom: '48px' }}>Last updated: January 1, 2025</p>
        
        <div style={{ fontSize: '15px', color: colors.gray, lineHeight: '1.9' }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Introduction</h2>
            <p style={{ marginBottom: '16px' }}>Base NYC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with our platform.</p>
            <p>By accessing or using our services, you agree to this Privacy Policy. If you do not agree with the terms of this policy, please do not access our website or use our services.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Information We Collect</h2>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.cream, marginBottom: '12px', marginTop: '24px' }}>Personal Information</h3>
            <p style={{ marginBottom: '16px' }}>We may collect personal information that you voluntarily provide to us when you register for an account, book studio space, subscribe to our newsletter, contact us, or apply for Base Connect membership. This may include your name, email address, phone number, company name, billing address, and payment information.</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.cream, marginBottom: '12px', marginTop: '24px' }}>Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain information about your device, including IP address, browser type, operating system, pages visited, and referring website addresses.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>How We Use Your Information</h2>
            <p style={{ marginBottom: '16px' }}>We use the information we collect to process bookings and transactions, provide and maintain our services, communicate with you about bookings and updates, send marketing communications (with your consent), improve our website and services, comply with legal obligations, and prevent fraudulent activity.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Information Sharing</h2>
            <p style={{ marginBottom: '16px' }}>We may share your information with service providers who assist in our operations (payment processors, email services, analytics providers), business partners when you use co-branded services, legal authorities when required by law, and third parties in connection with a merger, acquisition, or sale of assets. We do not sell your personal information to third parties.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information, including encryption of data in transit and at rest, regular security assessments, access controls and authentication, and employee training on data protection. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Cookies and Tracking</h2>
            <p>We use cookies and similar tracking technologies to remember your preferences, analyze website traffic, personalize content, and enable social media features. You can control cookies through your browser settings. Disabling cookies may affect the functionality of our website.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Your Rights</h2>
            <p style={{ marginBottom: '16px' }}>Depending on your location, you may have the right to access your personal information, correct inaccurate data, request deletion of your data, object to processing of your data, request data portability, and withdraw consent at any time.</p>
            <p>To exercise these rights, please contact us at legal@wearebase.nyc</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>California Privacy Rights</h2>
            <p>California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete personal information, and the right to opt-out of the sale of personal information.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Children's Privacy</h2>
            <p>Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child, we will delete it promptly.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Contact Us</h2>
            <p style={{ marginBottom: '8px' }}>If you have questions about this Privacy Policy, please contact us:</p>
            <p style={{ marginBottom: '8px' }}>Email: legal@wearebase.nyc</p>
            <p style={{ marginBottom: '8px' }}>Address: 120 East Broadway, New York, NY 10002</p>
            <p>Phone: (212) 555-1234</p>
          </section>
        </div>
      </section>
    </>
  );

  // ============================================
  // TERMS PAGE
  // ============================================

  const TermsPage = () => (
    <>
      <Breadcrumbs />
      <section style={{ padding: isMobile ? '60px 20px' : '80px 48px', maxWidth: '800px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', color: colors.red, marginBottom: '24px' }}>LEGAL</p>
        <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '700', marginBottom: '16px' }}>Terms of Service</h1>
        <p style={{ fontSize: '14px', color: colors.gray, marginBottom: '48px' }}>Last updated: January 1, 2025</p>
        
        <div style={{ fontSize: '15px', color: colors.gray, lineHeight: '1.9' }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Agreement to Terms</h2>
            <p style={{ marginBottom: '16px' }}>These Terms of Service ("Terms") constitute a legally binding agreement between you and Base NYC ("Company," "we," "us," or "our") concerning your access to and use of our website, studio facilities, production services, and Base Connect membership program (collectively, the "Services").</p>
            <p>By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access our Services.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Services Description</h2>
            <p>Base NYC provides studio rental facilities, production services, coworking space, and a professional network for creative professionals. Our services include Base Studios (physical studio space rental), Base Production (full-service production support from pre-production through post), and Base Connect (coworking membership and talent network access).</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>User Accounts</h2>
            <p style={{ marginBottom: '16px' }}>To access certain features of our Services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <p>You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Bookings and Payments</h2>
            <p style={{ marginBottom: '16px' }}>All studio bookings are subject to availability and confirmation. Payment is required at the time of booking unless otherwise agreed upon in writing. Cancellation policies vary by service type and will be communicated at the time of booking.</p>
            <p>We reserve the right to modify our pricing at any time. Price changes will not affect confirmed bookings made prior to the change.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Facility Rules</h2>
            <p style={{ marginBottom: '16px' }}>Users of our studio facilities agree to follow all posted rules and guidelines, treat equipment and facilities with care, report any damage or issues immediately, vacate the premises at the scheduled end time, and refrain from any illegal activities on the premises.</p>
            <p>Violation of facility rules may result in immediate termination of your booking without refund.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Intellectual Property</h2>
            <p style={{ marginBottom: '16px' }}>The Base NYC name, logo, and all related marks are trademarks of Base NYC. All content on our website, including text, graphics, logos, and images, is our property or the property of our licensors and is protected by intellectual property laws.</p>
            <p>You retain all rights to content you create while using our facilities. We may request permission to use images or footage created at our facilities for marketing purposes.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Limitation of Liability</h2>
            <p style={{ marginBottom: '16px' }}>To the maximum extent permitted by law, Base NYC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of our Services.</p>
            <p>Our total liability for any claim arising from these Terms or your use of the Services shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless Base NYC and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of our Services or your violation of these Terms.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Termination</h2>
            <p>We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of New York County, New York.</p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of the Services after any changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.cream, marginBottom: '16px' }}>Contact Us</h2>
            <p style={{ marginBottom: '8px' }}>If you have questions about these Terms, please contact us:</p>
            <p style={{ marginBottom: '8px' }}>Email: legal@wearebase.nyc</p>
            <p style={{ marginBottom: '8px' }}>Address: 120 East Broadway, New York, NY 10002</p>
            <p>Phone: (212) 555-1234</p>
          </section>
        </div>
      </section>
    </>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.cream, fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <GlobalAnimationStyles />
      <ArticleStyles />
      <Nav />
      <MobileMenu />
      <LeadershipModal />
      <VideoModal />
      <PortfolioModal />
      <DronePortfolioModal />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'studios' && <StudiosPage />}
      {currentPage === 'production' && <ProductionPage />}
      {currentPage === 'connect' && <ConnectPage />}
      {currentPage === 'drone' && <DronePage />}
      {currentPage === 'agencies' && <AgenciesPage />}
      {currentPage === 'entertainment' && <EntertainmentPage />}
      {currentPage === 'fashion' && <FashionPage />}
      {currentPage === 'creatives' && <CreativesPage />}
      {currentPage === 'blog' && <BlogPage />}
      {currentPage === 'article' && <BlogArticlePage />}
      {currentPage === 'contact' && <ContactPage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'membership' && <MembershipPage />}
      {currentPage === 'privacy' && <PrivacyPage />}
      {currentPage === 'terms' && <TermsPage />}
      <Footer />
    </div>
  );
}
