# Wedding Configuration - Test Plan

## Overview
Comprehensive testing for the wedding configuration system including API endpoints, form wizard, slug validation, theme selection, and QR code generation.

## Prerequisites
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Supabase connection active

## Test Scenarios

### 1. Database Migration
- [ ] Run migration: `npx supabase db push`
- [ ] Verify `guests` table created
- [ ] Verify `secondary_color`, `font_family`, `background_style` columns added to weddings
- [ ] Check RLS policies are applied
- [ ] Verify triggers are working

### 2. Wedding Creation Flow

#### 2.1 Access Creation Page
- [ ] Navigate to `/weddings/create`
- [ ] Page loads without errors
- [ ] Wizard interface displays correctly
- [ ] Progress bar shows step 1 of 5
- [ ] Mobile responsive layout works

#### 2.2 Bride Details Form (Step 1)
- [ ] Form displays with all fields
- [ ] Name field is required
- [ ] Display name is optional
- [ ] Email field validates email format
- [ ] Next button progresses to step 2
- [ ] Form data persists in localStorage
- [ ] Validation messages display correctly

#### 2.3 Groom Details Form (Step 2)
- [ ] Form displays with all fields
- [ ] Name field is required
- [ ] Display name is optional
- [ ] Email field validates email format
- [ ] Wedding date picker works
- [ ] Back button returns to step 1
- [ ] Previous data is retained
- [ ] Next button progresses to step 3

#### 2.4 Theme Selection (Step 3)
- [ ] Preset themes display in grid
- [ ] Clicking preset updates selection
- [ ] Custom color picker works
- [ ] Primary color is required
- [ ] Secondary color is optional
- [ ] Preview updates with selected colors
- [ ] Colors apply to preview elements
- [ ] Back button works
- [ ] Next button progresses to step 4

#### 2.5 Slug Validation (Step 4)
- [ ] Auto-generates slug from names
- [ ] Real-time validation works
- [ ] Shows "checking availability" during validation
- [ ] Shows green checkmark for available slugs
- [ ] Shows red error for taken slugs
- [ ] Suggestions appear for taken slugs
- [ ] Only allows lowercase letters, numbers, hyphens
- [ ] Length validation (3-50 characters)
- [ ] Reserved words are blocked
- [ ] URL preview updates dynamically

#### 2.6 Review & Confirm (Step 5)
- [ ] All entered data displays correctly
- [ ] Bride details show accurately
- [ ] Groom details show accurately
- [ ] Theme colors display as swatches
- [ ] Wedding URL shows prominently
- [ ] Warning about URL permanence displays
- [ ] Important notes section visible
- [ ] Back button allows editing
- [ ] Create button is enabled

### 3. API Endpoints Testing

#### 3.1 POST /api/weddings/create
- [ ] Creates wedding with valid data
- [ ] Creates bride_details record
- [ ] Creates groom_details record
- [ ] Links records correctly
- [ ] Returns wedding object with relations
- [ ] Handles missing required fields
- [ ] Handles duplicate slug
- [ ] Auto-generates slug if not provided
- [ ] Validates slug format
- [ ] Blocks reserved slugs

#### 3.2 POST /api/weddings/validate-slug
- [ ] Returns available: true for unique slugs
- [ ] Returns available: false for taken slugs
- [ ] Provides suggestions for taken slugs
- [ ] Validates slug format
- [ ] Blocks reserved words
- [ ] Handles empty slug

#### 3.3 GET /api/weddings/[slug]/config
- [ ] Fetches wedding with details
- [ ] Returns bride details
- [ ] Returns groom details
- [ ] Returns 404 for non-existent wedding
- [ ] Includes all configuration fields

#### 3.4 PATCH /api/weddings/[slug]/config
- [ ] Updates wedding fields
- [ ] Updates bride details
- [ ] Updates groom details
- [ ] Partial updates work
- [ ] Returns updated wedding
- [ ] Handles non-existent wedding

### 4. Success Page Testing

#### 4.1 Navigation to Success
- [ ] Redirects after successful creation
- [ ] URL format: `/[slug]/config/success`
- [ ] Page loads without errors

#### 4.2 Success Page Content
- [ ] Success message displays
- [ ] Couple names shown correctly
- [ ] Wedding URL displayed prominently
- [ ] Copy URL button works
- [ ] View Wedding Page link works
- [ ] QR code generates
- [ ] QR code contains correct URL
- [ ] Download QR code works
- [ ] Print QR code opens print dialog
- [ ] Next steps section displays
- [ ] Activation warning shows (if inactive)
- [ ] Links to settings work
- [ ] Links to guest management work

### 5. QR Code Component Testing

#### 5.1 QR Code Generation
- [ ] QR code generates for valid URL
- [ ] QR code uses theme color
- [ ] QR code is scannable
- [ ] Correct size renders
- [ ] Error correction level is high

#### 5.2 QR Code Actions
- [ ] Download creates PNG file
- [ ] Downloaded file has correct name
- [ ] Print preview shows formatted page
- [ ] Print page includes instructions
- [ ] URL displays below QR code

### 6. Form Validation Testing

#### 6.1 Required Fields
- [ ] Cannot proceed without bride name
- [ ] Cannot proceed without groom name
- [ ] Cannot create without theme color
- [ ] Error messages display clearly

#### 6.2 Email Validation
- [ ] Valid emails accepted
- [ ] Invalid emails show error
- [ ] Empty emails allowed (optional)

#### 6.3 Slug Validation
- [ ] Special characters removed
- [ ] Uppercase converted to lowercase
- [ ] Spaces not allowed
- [ ] Length limits enforced
- [ ] Reserved words rejected

### 7. Edge Cases

#### 7.1 Name Handling
- [ ] Single word names work
- [ ] Hyphenated names work
- [ ] Names with apostrophes work
- [ ] Very long names truncate appropriately
- [ ] Unicode characters handled

#### 7.2 Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Safari
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works on mobile browsers

#### 7.3 Network Issues
- [ ] Handles slow connections
- [ ] Shows loading states
- [ ] Handles API errors gracefully
- [ ] Retry logic works
- [ ] Error messages are helpful

#### 7.4 Data Persistence
- [ ] Form data saves to localStorage
- [ ] Data restored on page refresh
- [ ] Clear on successful submission
- [ ] Handle localStorage disabled

### 8. Performance Testing

#### 8.1 Load Times
- [ ] Wizard loads in < 2 seconds
- [ ] API responses < 500ms
- [ ] QR generation < 1 second
- [ ] Form navigation instant

#### 8.2 Responsive Design
- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640-1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch targets adequate size
- [ ] Forms usable on small screens

### 9. Security Testing

#### 9.1 Input Sanitization
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] HTML in inputs escaped
- [ ] File upload restrictions (if any)

#### 9.2 Authentication
- [ ] Service role used for admin operations
- [ ] RLS policies enforced
- [ ] Public can only view active weddings

### 10. Integration Testing

#### 10.1 End-to-End Flow
- [ ] Complete wizard flow works
- [ ] Wedding created in database
- [ ] All relations established
- [ ] Success page displays
- [ ] Can navigate to wedding page
- [ ] Theme applies correctly
- [ ] Names display throughout app

#### 10.2 Existing Features
- [ ] Memory submission works with new wedding
- [ ] Categories use correct names
- [ ] Filters show bride/groom names
- [ ] AI integration uses names correctly

## Manual Testing Steps

### Quick Test Sequence
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/weddings/create
3. Fill in test data:
   - Bride: Jane Smith (jane@test.com)
   - Groom: John Doe (john@test.com)
   - Wedding Date: Any future date
   - Theme: Royal Purple preset
   - Slug: test-wedding-[timestamp]
4. Complete wizard
5. Verify success page
6. Test QR code download
7. Visit wedding page
8. Submit a test memory
9. Verify names appear correctly

### Test Data
```javascript
const testWedding = {
  bride: {
    name: "Jane Elizabeth Smith",
    display_name: "Jane",
    email: "jane@test.com"
  },
  groom: {
    name: "John Michael Doe",
    display_name: "John",
    email: "john@test.com"
  },
  wedding_date: "2024-06-15",
  theme_color: "#8B5CF6",
  secondary_color: "#EC4899"
};
```

## Success Criteria
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Mobile experience smooth
- [ ] QR codes scannable
- [ ] Data persists correctly
- [ ] Error handling works
- [ ] Performance acceptable