# Wedding Configuration - Sprint 5 Tasks

## Overview
Implement wedding configuration system for couples to set up their memory collection page with bride/groom details, theme customization, and guest management.

## Tasks

### Epic: Wedding Setup Flow

- [x] Create wedding configuration API endpoints
  - POST /api/weddings/create - Create new wedding with bride/groom details
  - GET /api/weddings/[slug]/config - Get configuration for editing
  - PATCH /api/weddings/[slug]/config - Update wedding settings
  - POST /api/weddings/[slug]/validate-slug - Check slug availability

- [x] Build wedding setup form
  - Create multi-step form component
  - Add bride details section (name, email, display_name)
  - Add groom details section (name, email, display_name)
  - Add wedding date picker
  - Add validation for all fields

- [x] Implement slug validation and generation
  - Auto-generate slug from couple names
  - Validate slug uniqueness
  - Allow custom slug with validation
  - Show live availability check

- [x] Add theme color picker
  - Create color picker component
  - Support preset color themes
  - Preview theme application
  - Store theme preference

- [x] Create QR code generation
  - Generate QR code for wedding URL
  - Create downloadable QR code image
  - Add QR code to confirmation page
  - Support different sizes/formats

- [ ] Build Google Drive connection flow (manual OAuth)
  - Create instructions for manual OAuth setup
  - Add Drive credentials input
  - Test Drive connection
  - Store encrypted credentials

- [ ] Add wedding activation toggle
  - Create is_active toggle in settings
  - Show preview mode when inactive
  - Add activation confirmation
  - Update landing page based on status

- [ ] Create wedding configuration page (/[slug]/config)
  - Build settings page UI
  - Display current wedding details
  - Add activation toggle switch
  - Allow editing theme colors
  - Update wedding date
  - Save changes functionality

- [ ] Create setup confirmation page
  - Show all wedding details
  - Display QR code
  - Provide sharing instructions
  - Link to live wedding page

### Epic: Guest List Management

- [ ] Create guest list upload endpoint
  - POST /api/weddings/[slug]/guests/import
  - Support CSV file upload
  - Return import summary

- [ ] Build CSV parser for Zola format
  - Parse Zola guest list format
  - Handle various CSV formats
  - Validate guest data
  - Handle duplicates

- [ ] Add guest list management UI
  - Display guest list table
  - Show guest count statistics
  - Add search/filter functionality
  - Support sorting

- [ ] Implement bulk guest import
  - Process CSV in batches
  - Show import progress
  - Handle errors gracefully
  - Generate import report

- [ ] Create guest search API endpoint
  - GET /api/weddings/[slug]/guests/search
  - Support fuzzy name matching
  - Return guest details
  - Cache frequent searches

- [ ] Add manual guest entry form
  - Create single guest add form
  - Support quick add mode
  - Validate guest data
  - Update list in real-time

- [ ] Build guest list export functionality
  - Export to CSV format
  - Include all guest fields
  - Support filtered exports
  - Generate download link

### Epic: Landing Pages

- [ ] Create wedding-specific landing page
  - Dynamic route /[wedding_slug]
  - Fetch wedding details with bride/groom info
  - Apply custom theme
  - Show activation status

- [ ] Build welcome message with couple names
  - Use display_name from bride/groom details
  - Fallback to regular names
  - Format as "Bride & Groom"
  - Support custom welcome text

- [ ] Add wedding date display
  - Show formatted wedding date
  - Calculate countdown if future
  - Show "Celebrated on" if past
  - Support different date formats

- [ ] Apply custom theme colors
  - Use theme_color from wedding settings
  - Apply to buttons and accents
  - Support gradient backgrounds
  - Ensure accessibility

- [ ] Create mobile-optimized layout
  - Touch-friendly buttons
  - Responsive typography
  - Optimized images
  - Fast loading

- [ ] Add meta tags for sharing
  - Open Graph tags
  - Twitter Card tags
  - Custom description
  - Canonical URL

- [ ] Implement Open Graph images
  - Generate OG image with couple names
  - Include wedding date
  - Apply theme colors
  - Cache generated images

## Success Criteria

- [ ] Wedding setup flow works end-to-end
- [ ] Bride/groom details properly stored and displayed
- [ ] Slug validation prevents duplicates
- [ ] Theme colors apply throughout the site
- [ ] QR codes generate correctly
- [ ] Guest import handles Zola format
- [ ] Landing page looks beautiful on mobile
- [ ] All forms have proper validation
- [ ] Error handling for all edge cases

## Notes

- Use the new bride_details and groom_details tables
- Ensure backward compatibility during migration
- Focus on mobile-first design
- Keep setup process simple and intuitive
- Test with various name formats