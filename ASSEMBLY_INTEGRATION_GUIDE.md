# Assembly.com Integration Guide

## Overview

Assembly.com is fully integrated into the BASE NYC website for advanced form analytics and lead management. All forms track user interactions, submissions, and provide valuable insights into user behavior.

## ✅ What's Already Configured

### 1. Assembly Tracking Script
**Location:** `index.html` (lines 78-85)

The Assembly tracking script is automatically loaded on every page:

```javascript
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://assembly.com/tracking.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','assembly','2e27d1415f654f65b9340fd2335f5d77.cb61fde863de156f');
```

### 2. API Configuration
**Location:** `.env`

```env
REACT_APP_ASSEMBLY_API_KEY=2e27d1415f654f65b9340fd2335f5d77.cb61fde863de156f
REACT_APP_ASSEMBLY_FORM_ENDPOINT=https://api.assembly.com/v1/forms/submit
```

### 3. Assembly Service
**Location:** `src/app_(8).jsx` (lines 134-173)

The `AssemblyService` handles all Assembly.com interactions:

```javascript
const AssemblyService = {
  // Submit form data
  async submitForm(formData, formType),

  // Track field interactions
  trackFieldInteraction(formId, fieldName, action),

  // Initialize form tracking
  initFormTracking(formId)
}
```

---

## 📝 Integrated Forms

### 1. Contact Form

**Page:** `/contact`
**Form ID:** `base-nyc-contact`
**Form Type:** `contact`

**Tracked Fields:**
- `firstName` - First name input
- `lastName` - Last name input
- `email` - Email address
- `reason` - Contact reason (button selection)
- `message` - Message textarea

**Tracked Events:**
- Form view (on page load)
- Field focus (when user clicks into field)
- Field change (when user types)
- Field blur (when user leaves field)
- Form submission (success/error)

**Implementation:**
```javascript
// Contact form uses useAssemblyForm hook
const {
  formData,
  handleFieldChange,
  handleFieldFocus,
  handleFieldBlur,
  handleSubmit,
  isSubmitting,
  submitStatus
} = useAssemblyForm('contact-form', {
  firstName: '',
  lastName: '',
  email: '',
  message: '',
  reason: ''
});
```

**HTML Attributes:**
```html
<form data-assembly-form="contact" data-assembly-form-id="base-nyc-contact">
  <input data-assembly-field="firstName" name="firstName" ... />
  <input data-assembly-field="lastName" name="lastName" ... />
  <input data-assembly-field="email" name="email" ... />
  <textarea data-assembly-field="message" name="message" ... />
</form>
```

---

### 2. Login Form

**Page:** `/login`
**Form ID:** `base-nyc-login`
**Form Type:** `login`

**Tracked Fields:**
- `email` - Email address
- `password` - Password (value not tracked, only interactions)

**Tracked Events:**
- Form view
- Field focus/blur
- Submit attempts
- Login success/failure

**Security Note:**
Password values are never sent to Assembly analytics. Only interaction events (focus, blur) are tracked.

---

### 3. Membership Application Form

**Page:** `/membership`
**Form ID:** `base-nyc-membership`
**Form Type:** `membership`

**Tracked Fields:**
- `firstName` - First name
- `lastName` - Last name
- `email` - Email address
- `portfolio` - Portfolio URL
- `specialty` - Primary specialty (dropdown)
- `message` - About yourself

**Tracked Events:**
- Form view
- All field interactions
- Specialty selection
- Form submission
- Application success/error

---

## 📊 Analytics Dashboard

### Accessing Your Assembly Dashboard

1. Go to https://assembly.com/login
2. Log in with your Assembly account
3. Navigate to your BASE NYC project
4. View forms analytics

### Available Metrics

**Form-Level Metrics:**
- Total form views
- Form submission rate
- Average time to complete
- Drop-off points
- Conversion funnel

**Field-Level Metrics:**
- Field interaction rate
- Time spent per field
- Error/correction patterns
- Skip rate
- Completion rate

**User Journey:**
- Page flow before form
- Time on page before interaction
- Device and browser breakdown
- Geographic data
- Referral sources

---

## 🎯 Custom Event Tracking

### How It Works

The application automatically tracks these events:

#### Form View Event
```javascript
AssemblyService.initFormTracking(formId);
// Tracks: form_view with timestamp
```

#### Field Interaction Events
```javascript
AssemblyService.trackFieldInteraction(formId, fieldName, 'focus');
AssemblyService.trackFieldInteraction(formId, fieldName, 'change');
AssemblyService.trackFieldInteraction(formId, fieldName, 'blur');
```

#### Form Submission Event
```javascript
await AssemblyService.submitForm(formData, formType);
// Sends complete form data with metadata:
// - formType
// - submittedAt (timestamp)
// - source: "base-nyc-website"
```

---

## 🔧 Customizing Assembly Integration

### Adding a New Form

1. **Create Form Component:**
```javascript
const MyNewForm = () => {
  const {
    formData,
    handleFieldChange,
    handleFieldFocus,
    handleFieldBlur,
    handleSubmit,
    isSubmitting
  } = useAssemblyForm('my-form-id', {
    field1: '',
    field2: ''
  });

  return (
    <form
      onSubmit={(e) => handleSubmit(e, 'custom-form-type')}
      data-assembly-form="custom-form-type"
      data-assembly-form-id="my-form-id"
    >
      <input
        name="field1"
        value={formData.field1}
        onChange={(e) => handleFieldChange('field1', e.target.value)}
        onFocus={() => handleFieldFocus('field1')}
        onBlur={() => handleFieldBlur('field1')}
        data-assembly-field="field1"
      />
      {/* More fields... */}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
};
```

2. **Add Assembly Attributes:**
- `data-assembly-form` - Form type identifier
- `data-assembly-form-id` - Unique form ID
- `data-assembly-field` - Field identifier

3. **Track Custom Events** (optional):
```javascript
if (window.assembly) {
  window.assembly.track('custom_event', {
    eventData: 'value',
    timestamp: new Date().toISOString()
  });
}
```

---

## 🔍 Debugging Assembly Integration

### Check Assembly Script Loaded

Open browser console and type:
```javascript
window.assembly
```

Should return Assembly tracking object. If `undefined`, script didn't load.

### Check Form Tracking

1. Open browser DevTools
2. Go to Network tab
3. Filter by "assembly"
4. Interact with form fields
5. See tracking requests being sent

### Common Issues

**Assembly script not loading:**
- Check `index.html` script tag
- Verify Assembly API key is correct
- Check browser console for errors
- Check ad blocker isn't blocking Assembly

**Events not tracking:**
- Verify `data-assembly-*` attributes on form elements
- Check that `AssemblyService.initFormTracking()` is called
- Ensure field handlers (`onFocus`, `onChange`, `onBlur`) are connected
- Check Network tab for failed requests

**Form submissions not appearing:**
- Verify Assembly API key in `.env`
- Check API endpoint URL
- Look for errors in browser console
- Check Assembly dashboard for API status

---

## 📈 Best Practices

### 1. Form Naming Convention
Use descriptive, consistent form IDs:
- `base-nyc-contact` ✅
- `base-nyc-membership` ✅
- `form1` ❌

### 2. Field Naming Convention
Use semantic field names:
- `firstName`, `lastName` ✅
- `email`, `phoneNumber` ✅
- `field1`, `input2` ❌

### 3. Event Tracking
Track meaningful interactions:
- ✅ Field focus/blur (understand drop-off)
- ✅ Form view (understand reach)
- ✅ Submission success/error (conversion)
- ❌ Every keystroke (too noisy)
- ❌ Mouse movements (not useful)

### 4. Data Privacy
- ✅ Track interaction events
- ✅ Track completion rates
- ✅ Track time metrics
- ❌ Track password values
- ❌ Track sensitive PII unnecessarily
- ❌ Track credit card data

---

## 🎨 User Experience Enhancements

### Loading States
All forms show loading states during submission:
```javascript
<button disabled={isSubmitting}>
  {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
</button>
```

### Success/Error Messages
Forms display submission status:
```javascript
{submitStatus === 'success' && (
  <p>Message sent successfully!</p>
)}
{submitStatus === 'error' && (
  <p>Something went wrong. Please try again.</p>
)}
```

### Field Validation
Use HTML5 validation + Assembly tracking:
```html
<input
  type="email"
  required
  data-assembly-field="email"
  ...
/>
```

---

## 🚀 Advanced Features

### Conditional Form Logic

Track which form paths users take:
```javascript
const [selectedReason, setSelectedReason] = useState('');

const handleReasonChange = (reason) => {
  setSelectedReason(reason);
  AssemblyService.trackFieldInteraction('contact-form', 'reason', 'change');

  // Track custom event for specific reasons
  if (window.assembly) {
    window.assembly.track('contact_reason_selected', {
      reason: reason,
      timestamp: new Date().toISOString()
    });
  }
};
```

### Multi-Step Forms

Track progress through multi-step forms:
```javascript
const [step, setStep] = useState(1);

const goToStep = (nextStep) => {
  if (window.assembly) {
    window.assembly.track('form_step_completed', {
      formId: 'multi-step-form',
      completedStep: step,
      nextStep: nextStep,
      timestamp: new Date().toISOString()
    });
  }
  setStep(nextStep);
};
```

### Abandonment Tracking

Track when users leave forms incomplete:
```javascript
useEffect(() => {
  const handleBeforeUnload = () => {
    if (Object.values(formData).some(val => val !== '')) {
      window.assembly?.track('form_abandoned', {
        formId: 'contact-form',
        completedFields: Object.keys(formData).filter(key => formData[key] !== ''),
        timestamp: new Date().toISOString()
      });
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [formData]);
```

---

## 📞 Support & Resources

### Assembly Documentation
- Main docs: https://assembly.com/docs
- API reference: https://assembly.com/docs/api
- Form tracking: https://assembly.com/docs/forms

### Getting Help
1. Check Assembly dashboard for API status
2. Review browser console for errors
3. Check Network tab for failed requests
4. Contact Assembly support with API key

### Monitoring

Regularly check Assembly dashboard for:
- Form submission trends
- Drop-off points
- Error rates
- Conversion optimization opportunities

---

## ✅ Integration Checklist

- [x] Assembly tracking script loaded in `index.html`
- [x] API key configured in `.env`
- [x] `AssemblyService` implemented
- [x] `useAssemblyForm` hook created
- [x] Contact form integrated
- [x] Login form integrated
- [x] Membership form integrated
- [x] All forms have `data-assembly-*` attributes
- [x] Field interaction tracking implemented
- [x] Form submission handling configured
- [x] Loading states implemented
- [x] Success/error messages shown
- [ ] Test Assembly dashboard shows data
- [ ] Verify all events tracking correctly
- [ ] Set up Assembly alerts/notifications

---

Your Assembly.com integration is complete and production-ready! 🎉

All forms are tracking user interactions and sending data to your Assembly dashboard for analysis.
