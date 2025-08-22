# Sprint 4: Memory Album Display - Implementation Plan

## Overview
Create a beautiful, mobile-first memory album display with filtering and detail views. The UI should feel native on mobile devices while also working well on desktop.

## Design Requirements

### Mobile-First Principles
- Touch-optimized interactions (44px minimum touch targets)
- Thumb-reachable navigation and filters
- Smooth 60fps scrolling
- Native-feeling gestures (swipe, pull-to-refresh)
- Optimized for portrait viewing
- Fast initial load (< 2s on 3G)

### Visual Design
- Clean, wedding-appropriate aesthetic
- Focus on memories, not chrome
- Consistent with existing purple theme (#8B5CF6)
- High contrast for outdoor viewing
- Accessible color choices

## Technical Architecture

### Component Structure
```
app/
├── [weddingId]/
│   ├── page.tsx (existing - will enhance)
│   └── memories/
│       └── [memoryId]/
│           └── page.tsx (new - detail view)
└── components/
    ├── memories/
    │   ├── MemoryGrid.tsx (responsive grid)
    │   ├── MemoryCard.tsx (individual cards)
    │   ├── MemoryFilters.tsx (filter buttons)
    │   ├── MemoryDetail.tsx (modal/page view)
    │   ├── PhotoCarousel.tsx (swipeable photos)
    │   └── LoadingSkeleton.tsx (loading states)
    └── ui/
        └── PullToRefresh.tsx (mobile gesture)
```

### State Management
- Use React Query for data fetching/caching
- Optimistic updates for smooth UX
- Infinite scroll with intersection observer
- Local filter state (no server roundtrip)

### Performance Optimizations
- Lazy load images with blur placeholders
- Virtual scrolling for large lists
- Preload next batch on scroll
- Cache filtered results
- Debounce filter changes

## Implementation Phases

### Phase 1: Category Cards View (Mobile-First) ✅ COMPLETED
1. Create category-based homepage ✅
   - Remove guest list from main UI (only in modal) ✅
   - Display dynamic category cards (not fixed to 3) ✅
   - Show aggregated data per category ✅
2. Build category card component ✅
   - Display category name with elegant typography ✅
   - Show memory count for the category ✅
   - Show contributor count (unique feature added) ✅
   - Display AI-generated summary snippet ✅
   - Use best photo as background/thumbnail ✅
   - Photo count badges for multiple photos ✅
   - Memory type badges (Bride/Groom/Together) ✅
3. Polish the design ✅
   - Modern, wedding-appropriate aesthetic ✅
   - Smooth animations and transitions ✅
   - Premium feel with subtle shadows and effects ✅
   - Fixed Tailwind CSS issues ✅
   - Fixed input text visibility ✅

### Phase 2: Filtering & Interactions ✅ PARTIALLY COMPLETED
1. Add filter buttons ✅
   - Tabs at top (All/Bride/Groom/Together) ✅
   - Active state indication ✅
   - Smooth filter transitions ✅
   - Mobile responsive ✅
2. Memory count displays ✅
   - Total count per category ✅
   - Update dynamically with filters ✅
3. Pull-to-refresh ⏳ TODO
   - Native mobile gesture
   - Loading indicator
   - Haptic feedback (if available)

### Phase 3: Memory Detail View ✅ COMPLETED
1. Create modal/page for category memories ✅
   - Full-screen view on mobile ✅
   - Shows all memories in selected category ✅
   - Beautiful layout of individual memories ✅
   - Smooth open/close animation ✅
2. Individual memory cards in detail view ✅
   - Photo thumbnails ✅
   - Full memory text ✅
   - Contributor info ✅
   - Timestamps ✅
   - Memory type badges ✅
3. Memory expansion ✅
   - Click memory to expand/collapse ✅
   - Photo carousel with swipe support ✅
   - Complete text and metadata ✅
   - Show more/less for long memories ✅
4. Photo Carousel Features ✅
   - Touch/swipe gestures on mobile ✅
   - Arrow navigation on desktop ✅
   - Dot indicators ✅
   - Thumbnail strip (desktop) ✅
   - Photo attribution ✅
   - Keyboard navigation ✅

### Phase 4: Polish & Animations
1. Add micro-interactions
   - Card hover/press states
   - Smooth filter transitions
   - Stagger load animations
2. Loading states
   - Skeleton screens
   - Progressive image loading
   - Error states
3. Sharing functionality
   - Native share API on mobile
   - Copy link fallback
   - Social media previews

## API Endpoints Needed

### Existing (from Sprint 3)
- `GET /api/memories/[weddingId]` - List memories
- `GET /api/memories/[weddingId]/[memoryId]` - Single memory

### New/Enhanced
- Add pagination support to list endpoint
- Add filtering parameters (category)
- Return photo URLs in correct sizes
- Include AI summaries in response

## Mobile-Specific Considerations

### Touch Interactions
- Swipe to navigate photos
- Pull down to refresh
- Tap to open detail
- Long press for options
- Pinch to zoom photos

### Performance Budget
- Initial load: < 50KB JS
- Images: Lazy loaded with WebP
- Time to interactive: < 3s on 3G
- Smooth 60fps scrolling

### Device Testing Matrix
- iPhone SE (small screen)
- iPhone 14 Pro (standard)
- iPhone Pro Max (large)
- Samsung Galaxy S23
- iPad (tablet view)

## Design Reference
The user provided a UI mockup for the Memory Detail View showing:
- Clean card-based layout
- Photo carousel at top
- Journal entries as expandable cards
- Date-based organization
- Navigation arrows for desktop

We'll adapt this for mobile with:
- Full-screen modal approach
- Swipeable photo carousel
- Collapsible sections
- Sticky header with back button
- Bottom sheet for actions

## Success Metrics
- Loads in < 2s on 3G
- 60fps scrolling performance
- Zero layout shifts
- Touch targets ≥ 44px
- Works offline (after initial load)
- Accessibility score > 90

## Next Steps
1. Start with mobile memory grid
2. Add memory cards with real data
3. Implement infinite scroll
4. Add filters and counts
5. Build detail view modal
6. Add animations and polish
7. Test on real devices