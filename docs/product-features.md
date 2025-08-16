# Memory Album - Product Features & User Stories

## Product Vision
A digital memory collection platform that replaces traditional wedding guest books, allowing guests to share memories, stories, and photos that are automatically organized by AI into a beautiful, lasting keepsake.

## Core Value Proposition
- **For Couples**: Get a rich, multimedia memory book instead of just signatures
- **For Guests**: Share meaningful memories easily from your phone
- **For the Future**: AI-organized memories that can be explored and discovered years later

## User Personas

### 1. The Wedding Couple (George & Sarah)
- Want something more meaningful than a traditional guest book
- Tech-savvy enough to set up a simple website
- Value having digital memories they can revisit
- Want automatic backup of all content

### 2. Wedding Guests
- Range from tech-savvy to tech-challenged
- Using personal phones at the reception
- Want to share memories quickly without app downloads
- May want to see what others have shared

### 3. Future Couples (Phase 3)
- Discovered the platform online
- Want a turnkey solution for their wedding
- Willing to pay for premium features
- May want customization options

## User Stories - Phase 1 (MVP)

### Guest Experience

#### Accessing the Site
**As a wedding guest**
- I want to scan a QR code at my table
- So that I can quickly access the memory sharing site without typing URLs

**As a wedding guest**
- I want the site to load instantly on my phone
- So that I can use it during the reception without frustration

#### Sharing Memories

**As a wedding guest**
- I want to choose whether my memory is about the bride, groom, or both
- So that memories are properly categorized

**As a wedding guest**
- I want to share a text memory about the couple
- So that I can tell a story or share well-wishes

**As a wedding guest**
- I want to upload photos with my memory (up to 5)
- So that I can make my memory more vivid and personal

**As a wedding guest**
- I want to enter my name with my submission
- So that the couple knows who shared the memory

**As a wedding guest**
- I want to see a confirmation after submitting
- So that I know my memory was received

#### Viewing Memories

**As a wedding guest**
- I want to browse memories others have shared
- So that I can enjoy stories about the couple

**As a wedding guest**
- I want to see memories organized by topic/theme
- So that related stories are grouped together

**As a wedding guest**
- I want to see a photo carousel for each memory
- So that I can view all photos associated with a story

### Couple Experience

#### Before the Wedding

**As the wedding couple**
- I want to set up our memory album with our names and wedding date
- So that the site is personalized for our wedding

**As the wedding couple**
- I want to generate QR codes for table cards
- So that guests can easily access the site

**As the wedding couple**
- I want to customize our theme color
- So that the site matches our wedding aesthetic

#### During the Wedding

**As the wedding couple**
- I want to see memories appear in real-time
- So that we can enjoy them during the reception

**As the wedding couple**
- I want inappropriate content filtered automatically
- So that all memories remain family-friendly

#### After the Wedding

**As the wedding couple**
- I want all memories automatically backed up to our Google Drive
- So that we never lose these precious memories

**As the wedding couple**
- I want to download all memories and photos
- So that we have a permanent copy

**As the wedding couple**
- I want to see analytics about submissions
- So that we know participation levels

## Feature Specifications - Phase 1

### Memory Submission Form
- **Fields**:
  - Memory type selector (Bride / Groom / Both)
  - Guest name (required, text input)
  - Memory content (required, textarea, 10-1000 chars)
  - Photo upload (optional, max 5 photos, 10MB each)
- **Validation**:
  - Client-side validation for immediate feedback
  - Server-side validation for security
  - Profanity filter via Gemini safety settings
- **Feedback**:
  - Loading state during submission
  - Success message with option to add another
  - Error messages for failures

### AI Categorization System
- **Process**:
  1. New memory submitted
  2. Gemini analyzes content
  3. Compares against existing memories using function calling
  4. Either assigns to existing memory group or creates new one
  5. Generates/updates group title and summary
- **Examples**:
  - Multiple "college stories" → grouped under "College Days"
  - Several "proposal stories" → grouped under "The Proposal"
  - Various "funny moments" → grouped under theme

### Memory Album View
- **Layout**:
  - Grid of memory cards (mobile: 1 column, tablet: 2, desktop: 3)
  - Each card shows title, summary preview, photo count, contributor count
  - Filter buttons for Bride / Groom / Both / All
- **Memory Detail View**:
  - Photo carousel at top
  - AI-generated summary incorporating all submissions
  - Individual journal entries below with guest names and timestamps
  - Share button to send to others

### Real-time Updates
- **Implementation**: Supabase Realtime
- **Features**:
  - New memory notifications
  - Live count updates
  - Optional: Memory wall display for reception venue

### Background Processing
- **Embedding Generation** (via Vercel Cron every 5 mins):
  - Generate embeddings for new memories
  - Store in Qdrant with metadata
  - No user-facing features yet (prep for Phase 2)
- **Google Drive Backup** (daily at 2 AM):
  - Export all memories as JSON
  - Upload photos to organized folders
  - Send confirmation email to couple

## User Flows

### Guest Memory Submission Flow
```
1. Scan QR code → Land on wedding page
2. See welcome message with couple's names
3. Choose memory type (Bride/Groom/Both)
4. Enter name and memory text
5. Optionally add photos
6. Submit → See loading state
7. Success → Option to add another or browse memories
```

### Memory Browsing Flow
```
1. Land on album page
2. See grid of memory groups
3. Click on a memory card
4. View photo carousel and full story
5. Read individual contributions
6. Navigate back to browse more
```

### Couple Setup Flow (Simplified for MVP)
```
1. Access setup URL with auth token
2. Enter wedding details (names, date, slug)
3. Choose theme color
4. Connect Google Drive
5. Generate QR codes
6. Test the experience
```

## UI/UX Considerations

### Mobile-First Design
- Large touch targets (min 44px)
- Thumb-friendly navigation
- Optimized for one-handed use
- Fast load times (<3s on 3G)
- Offline-capable form (save draft locally)

### Accessibility
- High contrast text
- Large, readable fonts
- Clear button labels
- Alt text for images
- Keyboard navigation support

### Reception Environment
- Works in low-light conditions
- Minimal data usage
- Battery-efficient
- Quick interactions (< 1 minute to submit)

## Success Metrics

### Engagement Metrics
- **Participation rate**: % of guests who submit memories
- **Memories per guest**: Average number of submissions
- **Photo attachment rate**: % of memories with photos
- **Browse rate**: % who view other memories

### Quality Metrics
- **AI categorization accuracy**: % correctly grouped
- **Summary quality**: Couple satisfaction rating
- **Load time**: P95 < 3 seconds
- **Error rate**: < 1% submission failures

### Business Metrics (Phase 3+)
- **Conversion rate**: Visitors → Paid weddings
- **CAC**: Cost to acquire wedding couple
- **LTV**: Revenue per wedding
- **NPS**: Couple satisfaction score

## Future Feature Ideas (Phase 2+)

### RAG-Powered Features
- Semantic search: "Find all beach memories"
- Similar memory discovery: "More like this"
- Auto-generated timeline of relationship
- Guest relationship mapping
- Memory book PDF generation

### Enhanced Interactions
- Video messages (30-60 seconds)
- Voice notes with transcription
- Drawing/signature canvas
- Emoji reactions to memories
- Guest-to-guest comments

### Premium Features
- Custom domains
- Advanced themes/branding
- Professional memory book printing
- AI-generated video montage
- Anniversary reminders with memories

### Analytics & Insights
- Memory heatmap (when submitted during reception)
- Sentiment analysis dashboard
- Word clouds from memories
- Social graph of connections
- Engagement timeline

## Competitive Differentiation

### vs Traditional Guest Books
- Digital and searchable
- Includes photos and rich media
- AI-organized
- Accessible forever
- Can be shared with those not at wedding

### vs Generic Form Builders
- Purpose-built for weddings
- AI categorization
- Beautiful memory album view
- No technical setup required
- Automatic backups

### vs Other Wedding Tech
- No app download required
- Free for basic use
- Works on any phone
- AI makes it magical
- Focuses on memories, not logistics

## Risk Mitigation

### Technical Risks
- **AI categorization errors**: Manual override option
- **Photo upload failures**: Retry mechanism, queue system
- **Site crashes during reception**: Static fallback page
- **Data loss**: Multiple backup systems

### User Risks
- **Low participation**: Table card reminders, MC announcements
- **Inappropriate content**: AI moderation, manual review
- **Tech-challenged guests**: Simple UI, help QR code
- **Network issues**: Offline mode with sync

### Business Risks
- **Competition**: Fast iteration, unique AI features
- **Pricing resistance**: Generous free tier
- **Seasonal demand**: Expand to other events
- **Platform dependence**: Multi-cloud strategy

## Development Priorities

### Must Have (MVP)
- ✅ Memory submission with photos
- ✅ AI categorization
- ✅ Memory album view
- ✅ Mobile-responsive design
- ✅ Google Drive backup
- ✅ Basic setup flow

### Should Have (Phase 1.5)
- Real-time updates
- Improved AI summaries
- Download all memories
- Basic analytics
- Email notifications

### Nice to Have (Phase 2)
- RAG-powered search
- Video messages
- Custom themes
- Memory book generation
- Admin dashboard

### Future Vision (Phase 3+)
- Multi-language support
- White-label solution
- API for developers
- AI insights dashboard
- Cross-wedding analytics