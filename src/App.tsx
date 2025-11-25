import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/shared/Layout";
import Header from "./components/header/Header";
import PageWrapper from "./components/shared/PageWrapper";

// Pages
import AnonHomePage from "./pages/anonhomepage";
import LibraryPlaylists from "./pages/library/LibraryPlaylists";
import LibraryTracks from "./pages/library/LibraryTracks";
import LibraryAlbums from "./pages/library/LibraryAlbums";
import FavoritesPlaylists from "./pages/favorites/FavoritesPlaylists";
import FavoritesTracks from "./pages/favorites/FavoritesTracks";
import FavoritesAlbums from "./pages/favorites/FavoritesAlbums";
import Songs from "./pages/Songs";
import Info from "./pages/Info";

function App() {
  const location = useLocation();

  return (
    <Layout>
      <div className="flex flex-col h-full">

        {/* Sticky Header */}
        <div className="shrink-0 z-40 sticky top-0">
          <Header />
        </div>

        {/* Animated Page Transitions */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* HOME */}
            <Route
              path="/"
              element={
                <PageWrapper>
                  <AnonHomePage />
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
  );
}

export default App;
