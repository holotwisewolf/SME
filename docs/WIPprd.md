# Product Requirements Document: Spotify Music Explorer

## 1\. Overview

**App/Website Name:** Spotify Music Explorer

Spotify Music Explorer is a web application that serves as a highly customizable, advanced playlist management system for Spotify users, combining the best features of SoundCloud and Spotify. The platform allows users to search, discover, preview, and organize music through sophisticated tagging systems, custom playlists, and personalized recommendations. Users can create private or public ratings for albums and tracks, contributing to a community-driven recommendation system powered by a hybrid graph-based engine.

The application targets music enthusiasts, playlist curators, and Spotify users who want enhanced discovery and organization capabilities beyond Spotify's native features. It solves the problem of limited playlist customization, inadequate music discovery tools, and the lack of community-driven recommendations in existing music streaming platforms.

## 2\. Essential Core Features

* **Spotify Integration**: Search for music and albums using Spotify API with track previews
* **Advanced Playlist Management**: Create custom playlists with sophisticated filtering options
* **Dual Tagging System**: Pre-made and custom categories/tags for music organization
* **Dual Rating System**: Private personal ratings (1-10 scale) and public global ratings
* **Privacy Controls**: Toggle to publicize or keep ratings private
* **Hybrid Recommendation Engine**: Graph-based system using user preferences, content similarity, and community insights
* **Music Discovery**: Trending section based on global ratings and personalized recommendations
* **User Profiles**: Display rating statistics and personal music preferences
* **Spotify Link Generation**: Direct links to official Spotify tracks and albums
* **Real-time Updates**: Live updates to global ratings when users submit public ratings
* **Advanced Filtering**: Filter music by ratings, genres, tags, and custom criteria
* **Favorites Management**: Like and favorite tracks for easy access
* **Playlist Creation** No Spotify OAuth required for browsing music, tagging, rating, discovery, and building custom playlists within the app.

## 3\. Tech Stack

# ** Phase 1 — MVP (No Spotify OAuth Required)**

## **Front-End**
- **Framework:** React (TypeScript), Tailiwind CSS  
- **Dev Tool / Bundler:** Vite (`react-ts` template)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS
- **Hosting:** Vercel / Cloudflare Pages / Netlify  

---

## **Back-End (No OAuth)**
### **Supabase**
- PostgreSQL database  
- Authentication (email/password)  
- Row Level Security (RLS)  
- Storage (optional)  
- Real-time subscriptions (for global rating updates)  
- Optional Edge Functions (for secure Spotify Client Credentials token generation)  

**Description:**  
Supabase handles all core backend features. No traditional backend server is required for the MVP.

---

## **APIs & Integrations (Phase 1)**
### **Spotify Web API**
Used for:
- Searching tracks, albums, and artists  
- Track metadata and album details  
- Audio previews (30s)  
- Global music data  

**Authentication:**  
- **Client Credentials Flow only**  
- No Spotify login required  
- All responses public and safe  

### **Spotify Web Playback / Preview**
- Used for enhanced 30-second previews  
- No OAuth required  

---

## **Additional Technical Requirements (Phase 1)**
- Supabase PostgreSQL with structured + JSON fields  
- Real-time updates (e.g., global ratings)  
- Graph-based recommendation logic (client or Supabase function)  

---

# **📌 Phase 2 — Optional Feature: Spotify OAuth for Playlist Export**

## **Back-End (With OAuth)**
### **Supabase + Optional FastAPI Backend**
- **FastAPI** is ONLY required if implementing Spotify playlist export.  
- Hosted on Railway / Render (Preferred) / Fly.io (Supabase cannot host Python).

### **FastAPI responsibilities:**
- Handle Spotify Authorization Code Flow  
- `/auth/spotify/login` → send user to Spotify login  
- `/auth/spotify/callback` → exchange code for tokens  
- Store `refresh_token` in Supabase  
- Create and export a playlist to a user’s Spotify account  
- Add tracks to the exported playlist  

**Note:**  
FastAPI is *not* needed for any other features of the app.

---

## **APIs & Integrations (Phase 2)**
### **Spotify OAuth — Authorization Code Flow**
Used **only** for the optional export playlist feature:
- User authorizes app  
- App gains ability to create **one Spotify playlist**  
- Stored refresh token allows playlist creation later  

All other Spotify features still use the **Client Credentials Flow** from Phase 1.

---

# **🧠 AI Integration (Optional / Bonus)**
### **OpenAI GPT-4o**
- Generate music lyrics
- Suggest tags  
- Suggest playlist names  
- Enhance recommendation explanations  

This is optional and done only if extra time is available.

---

# ✅ Summary

### **Phase 1 (MVP)**
- React + Vite + TypeScript + Tailwind  
- Supabase as full backend  
- Spotify Client Credentials API only  
- Playlist/tag/rating system  
- Real-time DB + recommendation logic  
- NO OAuth needed

### **Phase 2 (Optional Enhancement)**
- Add FastAPI backend for Spotify OAuth  
- Only for exporting custom playlists to Spotify  
- Not required for core app functionality

## 4\. Design Preferences

**Interface:** Modern, music-focused design with dark theme options, card-based layouts for albums and tracks, and intuitive navigation similar to contemporary music streaming platforms.

**Typography:**

* Headings: Inter (modern, clean sans-serif)
* Body Text: Inter (consistent with headings for cohesive design)

**Additional Design Considerations:** Album artwork prominence, responsive grid layouts, smooth hover effects, and accessibility-compliant color contrasts.

**Design preferences in json**
```json
{
  "project_name": "Spotify_Music_Explorer",
  "design_mode": "Dark_Theme_Primary",
  "layout_structure": {
    "header": {
      "element": "Fixed Header",
      "components": ["Search Input", "Logout Button", "Login Button"],
      "styling_note": "Utilize flexbox for horizontal alignment and spacing."
    },
    "sidebar": {
      "element": "Fixed Vertical Navigation",
      "width": "60px",
      "icons": ["Headphones/Logo", "Folders/Favorites", "Music/Search", "Info/Settings"],
      "styling_note": "Card/Surface color for background, centered icon alignment."
    },
    "main_content": {
      "element": "Playlist/Favorites Dashboard",
      "arrangement": "Two sections: Header (Title/Time) and Content Grid.",
      "content_grid": "Flexible grid/flexbox for displaying 3+ cards horizontally."
    }
  },
  "color_palette": {
    "background_primary": {
      "hex": "#696969",
      "purpose": "Main canvas background (Dark Mode)"
    },
    "surface_secondary": {
      "hex": "#292929",
      "purpose": "Card backgrounds, Sidebar background, and raised elements"
    },
    "text_primary_contrast": {
      "hex": "#D1D1D1",
      "purpose": "General body text and high-contrast labels"
    },
    "text_highlight_coral": {
      "hex": "#FFD1D1",
      "purpose": "Main titles (Playlist) and timed metrics (07:05:58)"
    },
    "accent_spotify_green": {
      "hex": "#BAFFB5",
      "purpose": "Call-to-action buttons, success indicators, interactive hover effects"
    },
    "accent_electric_blue": {
      "hex": "#D1F3FF",
      "purpose": "Links, search bar focus, secondary action icons"
    }
  },
  "typography": {
    "font_family": "Inter, sans-serif",
    "weights": ["400", "600", "700"],
    "styles": {
      "title_main": {
        "size": "28px",
        "weight": "700",
        "color": "text_highlight_coral"
      },
      "card_name": {
        "size": "16px",
        "weight": "600",
        "color": "text_primary_contrast"
      },
      "body_icon_label": {
        "size": "12px",
        "weight": "400",
        "color": "text_primary_contrast"
      }
    }
  },
  "spacing_and_aesthetics": {
    "unit_base": "8px",
    "border_radius": "6px",
    "card_padding": "16px",
    "icon_size": "24px",
    "transparent_effect": "The card backgrounds should have a 60% transparency effect",
    "hover_effect": "Subtle transition on background_secondary to enhance interactivity."
  }
}
```

## Development Phases

### Phase 1 (Core MVP)
No OAuth required. Users can:
* Search Spotify’s public catalog
* View albums, tracks, genres
* Create and manage custom playlists inside the app
* Create and manage folders (playlists + albums)
* Rate and tag music
* Use recommendation features
* Manage their own user profiles via Supabase
* View Community Playlist, Community Music

### Phase 2 (Optional Extra Feature)
Spotify OAuth is introduced only for exporting playlists:
* User clicks “Export to Spotify”
* User is redirected to Spotify OAuth page
* After approval, FastAPI backend receives token
* Playlist is created in the user’s Spotify account
* Access/refresh tokens stored securely in Supabase


## 5\. All Screens/Pages

### Home Page (`/`)

* **Route:** `/`
* **UI Elements:**
    * Navigation header with logo and main menu
    * Hero section with search bar
    * Community play section (global ratings)
    * Personalized recommendations carousel
    * Recently added tracks section
    * Footer with links and information
* **Navigation:** Entry point from external links, navigate to search, profile, playlists

### Search Results (`/search`)

* **Route:** `/search?q={query}`
* **UI Elements:**
    * Search input with filters dropdown
    * Filter options (genre, rating, tags)
    * Results grid with album/track cards
    * Pagination controls
    * Preview play buttons
    * Rating components (personal/global)
* **Navigation:** From home search, returns to home or navigates to album details

### Album Details (`/album/:id`)

* **Route:** `/album/{spotify_album_id}`
* **UI Elements:**
    * Album artwork and information
    * Track listing with preview buttons
    * Personal and global rating displays
    * Spotify link button
    * Tags display and edit interface
    * Similar albums recommendations
* **Navigation:** From search results, returns to search or home

### My Playlists (`/playlists`)

* **Route:** `/playlists`
* **UI Elements:**
    * Create new playlist button
    * Change playlist colour
    * Playlist cards grid
    * Filter and sort options
    * Search within playlists
    * Playlist management controls
* **Navigation:** From main menu, navigates to individual playlists

### Playlist Details (`/playlist/:id`)

* **Route:** `/playlist/{playlist_id}`
* **UI Elements:**
    * Playlist header with title and description
    * Edit playlist information modal
    * Track list with drag-and-drop reordering
    * Remove track/albums buttons
    * Add tracks/albums interface
    * Share playlist options
    * Export to Spotify button (optional feature)
* **Navigation:** From playlists page, returns to playlists

### User Profile (`/profile`)

* **Route:** `/profile`
* **UI Elements:**
    * Profile information display
    * Rating statistics (public/private counts)
    * Privacy settings toggle
    * Account preferences
    * Recently rated albums/tracks
* **Navigation:** From main menu, navigates to settings or back to home

### Trending (`/community`)

* **Route:** `/community`
* **UI Elements:**
    * Top-rated community playlist grid
    * Top-rated community tracks grid
    * Top-rated community albums grid
    * Time period filters (week, month, year, all time)
    * Tag/Custom tags filters (vibes, study)
    * Genre filters (rock, heavy metal)
    * Genre-specific trending sections
    * Community rating insights / Community comments
* **Navigation:** From main menu or home community section

### Login (`/login`)

* **Route:** `/login`
* **UI Elements:**
    * Email/username input
    * Password input
    * Login button
    * Register link
    * Social authentication options (Extra feature, not necessary)
    * Forgot password link
* **Navigation:** From any protected route, redirects to home after login

### Register (`/register`)

* **Route:** `/register`
* **UI Elements:**
    * Username input
    * Email input
    * Password input
    * Confirm password input
    * Terms and conditions checkbox
    * Register button
    * Login link
* **Navigation:** From login page or main menu, redirects to profile setup

## 6\. App Menu and Navigation Structure

**Navigation System:** Horizontal navigation bar with hamburger menu for mobile responsiveness

**Main Navigation Structure:**

* **Primary Navigation Bar:**
    * Logo/Home link
    * Search bar (always visible)
    * My Playlists
    * Community
        * Community rated playlists
        * Community rated songs
    * Profile dropdown
        * Profile Settings
        * Privacy Settings
        * Logout

**Secondary Navigation:**

* **Footer Links:**
    * About
    * Privacy Policy
    * Terms of Service
    * API Documentation
    * Contact Support

**User Flow Navigation:**

* Breadcrumb navigation on detail pages
* Back buttons on secondary pages
* Quick action floating buttons for common tasks
* Contextual menus for playlist and track management

## 7\. User Flow

1. **Initial Access:**
    * User visits homepage (`/`)
    * Sees trending music and basic search functionality
    * Prompted to register/login for full features
2. **Registration/Authentication:**
    * User clicks register and completes account creation (`/register`)
    * Email verification and initial profile setup
    * Redirected to personalized home dashboard
3. **Music Discovery:**
    * User searches for music using the search bar
    * Views search results with filtering options (`/search`)
    * Previews tracks using Spotify API integration
    * Clicks on album for detailed view (`/album/:id`)
4. **Rating and Organization:**
    * User rates album (personal rating 1-10)
    * Chooses to make rating public or private
    * Adds custom tags or selects from pre-made categories
    * Adds tracks to custom playlists
    * Add albums/playlists into folders
5. **Playlist Management:**
    * User navigates to "My Playlists" (`/playlists`)
    * Creates new playlist or manages existing ones
    * Organizes tracks/albums using drag-and-drop interface (`/playlist/:id`)
    * Applies filters and tags for advanced organization
    * Phase 1: Export to Spotify button (placeholder in MVP, functional in Phase 2 if time allows)
    * Optional (phase 2): Export Playlist to Spotify button, which triggers Spotify OAuth if not already connected (This feature will be implemented only if time allows. In Phase 1, the Export button is present but not functional.)
6. **Personalized Recommendations:**
    * System processes user ratings and preferences
    * Generates recommendations using graph-based algorithm
    * User views personalized suggestions on homepage
    * Discovers new music through trending section (`/trending`)
7. **Community Interaction:**
    * User views global ratings and community insights
    * Participates in community ratings (if privacy settings allow)
    * Explores music based on community preferences
8. **Profile Management:**
    * User accesses profile settings (`/profile`)
    * Adjusts privacy settings for rating visibility
    * Reviews personal rating statistics and music taste analysis
    * Manages account preferences and data export options
9. **Spotify Integration:**
    * User clicks Spotify links to access official tracks
    * Uses preview functionality for quick music sampling
    * Future: Automated playlist creation in Spotify account (OAuth integration)