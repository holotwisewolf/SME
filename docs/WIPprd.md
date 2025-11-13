# Product Requirements Document: Spotify Music Explorer

## 1\. Overview

**App/Website Name:** Spotify Music Explorer

Spotify Music Explorer is a web application that serves as a highly customizable, advanced playlist management system for Spotify users, combining the best features of SoundCloud and Spotify. The platform allows users to search, discover, preview, and organize music through sophisticated tagging systems, custom playlists, and personalized recommendations. Users can create private or public ratings for albums and tracks, contributing to a community-driven recommendation system powered by a hybrid graph-based engine.

The application targets music enthusiasts, playlist curators, and Spotify users who want enhanced discovery and organization capabilities beyond Spotify's native features. It solves the problem of limited playlist customization, inadequate music discovery tools, and the lack of community-driven recommendations in existing music streaming platforms.

## 2\. Essential Core Features

* **Spotify Integration**: Search for music and albums using Spotify API with track previews
* **Advanced Playlist Management**: Create custom playlists with sophisticated filtering options
* **Dual Tagging System**: Pre-made and custom categories/tags for music organization
* **Dual Rating System**: Private personal ratings (1-5 scale) and public global ratings
* **Privacy Controls**: Toggle to publicize or keep ratings private
* **Hybrid Recommendation Engine**: Graph-based system using user preferences, content similarity, and community insights
* **Music Discovery**: Trending section based on global ratings and personalized recommendations
* **User Profiles**: Display rating statistics and personal music preferences
* **Spotify Link Generation**: Direct links to official Spotify tracks and albums
* **Real-time Updates**: Live updates to global ratings when users submit public ratings
* **Advanced Filtering**: Filter music by ratings, genres, tags, and custom criteria
* **Favorites Management**: Like and favorite tracks for easy access

## 3\. Tech Stack

**Front-End:** React, CSS, HTML
**Back-End OPTION 1:** Supabase (authentication, database, storage, real-time capabilities, very much like json)
**Back-End OPTION 2:** SQLite (showcase back-end capabilities, is this needed for the course)
**AI Integration:** OpenAI GPT-4o for enhanced music recommendation descriptions and tag suggestions (Extra features: only if we have extra time / effort)
**APIs & Integrations:**

* Spotify Web API (search, track data, previews, album information)
* Spotify Web Playback / Preview (for enhanced preview functionality)

**Additional Technical Requirements:**

* Document structure using Supabase's PostgreSQL with JSON fields (If we use supabase)
* Real-time subscriptions for global rating updates
* Graph-based recommendation algorithm implementation
* OAuth integration preparation for future Spotify playlist creation (Extra Features)

## 4\. Design Preferences

**Interface:** Modern, music-focused design with dark theme options, card-based layouts for albums and tracks, and intuitive navigation similar to contemporary music streaming platforms.

**Typography:**

* Headings: Inter (modern, clean sans-serif)
* Body Text: Inter (consistent with headings for cohesive design)

**Additional Design Considerations:** Album artwork prominence, responsive grid layouts, smooth hover effects, and accessibility-compliant color contrasts.

**Design preferences in json**
```json
{
  "project_name": "Spotify_Album_Explorer",
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

## 5\. All Screens/Pages

### Home Page (`/`)

* **Route:** `/`
* **UI Elements:**
    * Navigation header with logo and main menu
    * Hero section with search bar
    * Trending albums section (global ratings)
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
    * Remove track buttons
    * Add tracks interface
    * Export to Spotify button (future feature)
    * Share playlist options
* **Navigation:** From playlists page, returns to playlists

### User Profile (`/profile`)

* **Route:** `/profile`
* **UI Elements:**
    * Profile information display
    * Rating statistics (public/private counts)
    * Privacy settings toggle
    * Account preferences
    * Recently rated albums
    * Personal music taste graph
    * Export data options
* **Navigation:** From main menu, navigates to settings or back to home

### Trending (`/trending`)

* **Route:** `/trending`
* **UI Elements:**
    * Top-rated albums grid
    * Time period filters (week, month, year)
    * Genre-specific trending sections
    * Community rating insights
    * Rising albums section
* **Navigation:** From main menu or home trending section

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
    * Trending
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
    * User rates album (personal rating 1-5)
    * Chooses to make rating public or private
    * Adds custom tags or selects from pre-made categories
    * Adds album/tracks to custom playlists
5. **Playlist Management:**
    * User navigates to "My Playlists" (`/playlists`)
    * Creates new playlist or manages existing ones
    * Organizes tracks using drag-and-drop interface (`/playlist/:id`)
    * Applies filters and tags for advanced organization
6. **Personalized Recommendations:**
    * System processes user ratings and preferences
    * Generates recommendations using graph-based algorithm
    * User views personalized suggestions on homepage
    * Discovers new music through trending section (`/trending`)
7. **Community Interaction:**
    * User views global ratings and community insights
    * Participates in community ratings (if privacy settings allow)
    * Explores trending music based on community preferences
8. **Profile Management:**
    * User accesses profile settings (`/profile`)
    * Adjusts privacy settings for rating visibility
    * Reviews personal rating statistics and music taste analysis
    * Manages account preferences and data export options
9. **Spotify Integration:**
    * User clicks Spotify links to access official tracks
    * Uses preview functionality for quick music sampling
    * Future: Automated playlist creation in Spotify account (OAuth integration)