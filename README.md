# 🎥 Youtube Sangam

**Youtube Sangam** (meaning *union* or *confluence* in Hindi) is an all-in-one, premium, integrated command center and toolkit designed for YouTubers, streamers, and video creators. It brings together content scheduling, deep-dive data analytics, interactive audience metrics, intelligent performance categorization, a personal gaming creator backlog, and goal tracking into a unified, professional workspace.

---

## 🚀 Key App Capabilities & Features

### 1. 📊 Content Analysis (Featured View)
*   **Dynamic Visualizations**: Render interactive bar charts powered by **Recharts** showing the Top 10 videos by views and likes.
*   **Interactive Content Directory**: Search, sort, and filter through the last 200 uploads (videos, shorts, and live streams) with a fully paginated catalog.
*   **Deep Linking**: Click any thumbnail or row to bring up a confirmation modal that routes directly to watch on YouTube.

### 2. 📅 Content Scheduling (Calendar View)
*   **Grid-Based Timeline**: A beautiful, custom monthly calendar mapping past upload histories.
*   **Content Type Differentiation**: Visual tags uniquely styling traditional videos, live streams, and YouTube Shorts.
*   **Day Detail Modals**: Click on any calendar day to open an overlay summarizing every piece of content posted on that specific date along with individual view and like counts.

### 3. 📈 Channel Analytics (Analytics View)
*   **Counter Animations**: Smooth, high-fidelity number counters scaling stats on load.
*   **Core Summary Metrics**: Rapid access to overall statistics including Total Uploads, Combined Views, Combined Likes, and Average Views per video.
*   **Upload Schedule Distribution**: High-contrast bar charts grouping historical video publish frequencies by day of the week.
*   **Latest Performance Spotlight**: A layout card highlighting the viewer response to the channel's newest traditional videos or live streams.

### 4. 🎯 Creator Command Center (Track View — *Authentication Required*)
*   **Creator Archetype Engine**: Automatically parses the last 200 videos to classify the channel profile as a **Classic Creator**, **Shorts Specialist**, **Live Streamer**, **Long-form Specialist**, or **Hybrid Creator**.
*   **Engagement Rate Metrics**: Graphically renders audience interaction metrics (likes-to-views percentages) across distinct formats.
*   **Strategic Insights**: Generates custom suggestions and warnings (e.g. leveraging Shorts as trailers, optimal formats) based on view velocity.
*   **Audience Resonance Panel**: Identifies top-performing topics, fan-favorite streams, upload regularity rhythm, and ideal video title length strategy (+% view velocity uplift).
*   **Subscriber Milestone Timeline**: A visual tracker comparing current subscription counts to major milestones (100 to 1M+) with an active percentage completion bar.
*   **Firestore Goals Tracker**: Add, toggle, and delete channel objectives, synced in real-time.
*   **RAWG Game Backlog Manager**: *Tailor-made for gaming creators!* Integrates with the **RAWG Video Game Database** to search over 500,000+ games, add titles to a custom workspace, rate them (0 to 5 stars), and assign playthrough statuses (`Playing`, `Planned`, `Completed`, `Pause`, `Gave Up`).
*   **Stream Agenda Scheduler**: Plan, date-stamp, time-stamp, and organize future streams or upcoming videos in a persistent Firestore-synchronized agenda.

### 5. 📂 Playlists Manager (Playlists View)
*   **Channel Folders**: Browse through all public playlists from the channel complete with custom thumbnails and video counts.
*   **Advanced Indexes**: Dive into individual playlists to search and filter videos by upload date (newest/oldest), views, or likes.
*   **Share Utilities**: Single-click URL sharing functionality that copies the playlist link directly to the clipboard.

### 6. 💬 Community Moderation Feed (Community View — *Authentication Required*)
*   **Engagement Streams**: Live aggregates top comments from the 5 most recent uploads into a cohesive community dashboard.
*   **Discussion Analytics**: Displays comment timelines, likes, and publisher profiles.
*   **Direct Moderation & Replies**: Single-click actions that route creators directly to the specific comment thread on YouTube.

### 7. 🔮 AI Studio (AI Studio View — *Authentication Required*)
*   **YouTube Title Generator**: A fully embedded workspace to generate high-converting, optimized video titles using Gemini-driven parameters.

---

## 🗺️ App Onboarding & User Experience
*   **Walkthrough Tour**: Implements an interactive onboarding tour that guides new creators through the workspace interface step-by-step.
*   **Responsive Menus**: Complete mobile viewport flexibility with adaptive hamburger menus and slide-out navigation bars.

---

## 🛠️ Technical Architecture & Stack

### Frontend & Libraries
*   **Framework**: React 19 + TypeScript + Vite 6
*   **Style**: Tailwind CSS (Dark Slate Theme)
*   **Animations**: custom CSS animations, transition classes, and Framer Motion logic.
*   **Data Visualizations**: Recharts
*   **Icons**: Lucide-React & Custom Vector SVGs

### Integrations & Storage
*   **YouTube Data API v3**: Real-time pipeline retrieving video metrics, live-streaming details, playlists, and comments.
*   **RAWG API**: Direct searching and details parsing of external video game titles.
*   **Firebase Authentication**: High-security, client-side session authentication.
*   **Google Cloud Firestore**: Persistent, durable, and real-time database storage for tracking user-authored schedules, milestones, backlogs, and goals.

---

## ⚙️ Configuration & Environment Setup

Create a `.env.local` file at the root of your project directory and configure the following variables:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Running the Project Locally

1. Install package dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Build the application for production:
   ```bash
   npm run build
   ```
