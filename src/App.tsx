import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "./components/shared/Layout";
import Header from "./components/header/Header";
import PageWrapper from "./components/shared/PageWrapper";

// Pages
import PlaylistDashboard from "./features/playlists/playlists_pages/PlaylistDashboard";
import LoginPage from "./pages/LoginPage";
import LibraryPlaylists from "./pages/library/LibraryPlaylists";
import LibraryTracks from "./pages/library/LibraryTracks";
import LibraryAlbums from "./pages/library/LibraryAlbums";
import FavoritesPlaylists from "./features/favourites/favourites_pages/FavoritesPlaylists";
import FavoritesTracks from "./features/favourites/favourites_pages/FavoritesTracks";
import FavoritesAlbums from "./features/favourites/favourites_pages/FavoritesAlbums";
import Songs from "./pages/Songs";
import Info from "./pages/Info";

function App() {
  const location = useLocation();

  return (
    <>
      <Layout>
        <div className="flex flex-col h-full">

          {/* Sticky Header */}
          <div className="shrink-0 z-40 sticky top-0">
            <Header />
          </div>

          {/* Animated Page Transitions */}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              {/* LOGIN (fullscreen drawer, no wrapper) */}
              <Route path="/login" element={<LoginPage />} />

              {/* HOME */}
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <PlaylistDashboard />
                  </PageWrapper>
                }
              />

              {/* --------------------------- */}
              {/*         LIBRARY             */}
              {/* --------------------------- */}
              <Route path="/library">
                {/* Default: redirect to playlists */}
                <Route index element={<Navigate to="playlists" replace />} />
                <Route
                  path="playlists"
                  element={
                    <PageWrapper>
                      <LibraryPlaylists />
                    </PageWrapper>
                  }
                />
                <Route
                  path="tracks"
                  element={
                    <PageWrapper>
                      <LibraryTracks />
                    </PageWrapper>
                  }
                />
                <Route
                  path="albums"
                  element={
                    <PageWrapper>
                      <LibraryAlbums />
                    </PageWrapper>
                  }
                />
              </Route>

              {/* --------------------------- */}
              {/*         FAVORITES           */}
              {/* --------------------------- */}
              <Route path="/favorites">
                {/* Default: redirect to playlists */}
                <Route index element={<Navigate to="playlists" replace />} />
                <Route
                  path="playlists"
                  element={
                    <PageWrapper>
                      <FavoritesPlaylists />
                    </PageWrapper>
                  }
                />
                <Route
                  path="tracks"
                  element={
                    <PageWrapper>
                      <FavoritesTracks />
                    </PageWrapper>
                  }
                />
                <Route
                  path="albums"
                  element={
                    <PageWrapper>
                      <FavoritesAlbums />
                    </PageWrapper>
                  }
                />
              </Route>

              {/* SONGS */}
              <Route
                path="/songs"
                element={
                  <PageWrapper>
                    <Songs />
                  </PageWrapper>
                }
              />

              {/* INFO */}
              <Route
                path="/info"
                element={
                  <PageWrapper>
                    <Info />
                  </PageWrapper>
                }
              />

            </Routes>
          </AnimatePresence>

        </div>
      </Layout>
    </>
  );
}

export default App;
