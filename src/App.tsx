import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "./components/shared/Layout";
import Header from "./components/header/Header";
import PageWrapper from "./components/shared/PageWrapper";

// Pages
import LoginPage from "./pages/auth_pages/LoginPage";
import LibraryPlaylists from "./pages/library_pages/LibraryPlaylists";
import LibraryTracks from "./pages/library_pages/LibraryTracks";
import LibraryAlbums from "./pages/library_pages/LibraryAlbums";
import FavouritesPlaylists from "./pages/favourites_pages/FavouritesPlaylists";
import FavouritesTracks from "./pages/favourites_pages/FavouritesTracks";
import FavouritesAlbums from "./pages/favourites_pages/FavouritesAlbums";
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

              {/* HOME - Redirect to Library Playlists */}
              <Route path="/" element={<Navigate to="/library/playlists" replace />} />

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
              {/*         FAVOURITES          */}
              {/* --------------------------- */}
              <Route path="/favourites">
                {/* Default: redirect to playlists */}
                <Route index element={<Navigate to="playlists" replace />} />
                <Route
                  path="playlists"
                  element={
                    <PageWrapper>
                      <FavouritesPlaylists />
                    </PageWrapper>
                  }
                />
                <Route
                  path="tracks"
                  element={
                    <PageWrapper>
                      <FavouritesTracks />
                    </PageWrapper>
                  }
                />
                <Route
                  path="albums"
                  element={
                    <PageWrapper>
                      <FavouritesAlbums />
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
