import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { LoginProvider } from "./features/auth/components/LoginProvider";
import LoginDrawer from "./features/auth/components/LoginDrawer";

import Layout from "./components/shared/Layout";
import Header from "./components/header/Header";
import PageWrapper from "./components/shared/PageWrapper";

// Pages
import LibraryPlaylists from "./features/library/library_pages/LibraryPlaylists";
import LibraryTracks from "./features/library/library_pages/LibraryTracks";
import LibraryAlbums from "./features/library/library_pages/LibraryAlbums";
import Songs from "./pages/Songs";
import Info from "./pages/Info";
import SignUpPage from "./features/auth/pages/SignUp";
import TestingGround from "./features/dev/dev_pages/testing_ground";
import DevRoute from "./features/dev/DevRoute";
import SetUpUserProfile from "./features/user/user_pages/SetUpUserProfile";
import UserAccount from "./features/user/user_pages/UserAccount";
import UserSettings from "./features/user/user_pages/UserSettings";
import { TracksFullPage } from "./features/spotify/pages/TracksFullPage";
import { AlbumsFullPage } from "./features/spotify/pages/AlbumsFullPage";
import { ArtistsFullPage } from "./features/spotify/pages/ArtistsFullPage";
import FavouritesTracks from "./features/favourites/favourites_pages/FavouritesTracks";

function App() {
  const location = useLocation();
  return (
    <LoginProvider>
      <AnimatePresence mode="wait">
        {location.pathname === "/signup" && (
          <SignUpPage key="signup" />
        )}
        {location.pathname === "/setup-profile" && (
          <SetUpUserProfile key="setup-profile" />
        )}
        {location.pathname === "/account" && (
          <UserAccount key="account" />
        )}
        {location.pathname === "/settings" && (
          <UserSettings key="settings" />
        )}
      </AnimatePresence>

      <Layout>
        <div className="flex flex-col h-full">

          {/* Sticky Header */}
          <div className="shrink-0 z-40 sticky top-0">
            <Header />
          </div>

          {/* Animated Page Transitions */}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              {/* HOME → redirect */}
              <Route path="/" element={<Navigate to="/library/playlists" replace />} />

              {/* LIBRARY --------------------- */}
              <Route path="/library">
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

              {/* FAVOURITES ------------------ */}
              <Route path="/favourites">
                <Route index element={<Navigate to="playlists" replace />} />

                <Route
                  path="playlists"
                  element={
                    <PageWrapper>
                      Test
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
                      Test
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

              <Route path="/testing-ground" element={
                <DevRoute>
                  <PageWrapper>
                    <TestingGround />
                  </PageWrapper>
                </DevRoute>
              }
              />

              {/* Overlay Routes (rendered by AnimatePresence above, but needed here for router matching) */}
              <Route path="/signup" element={<></>} />
              <Route path="/setup-profile" element={<></>} />
              <Route path="/account" element={<></>} />
              <Route path="/settings" element={<></>} />

              {/* SPOTIFY FULL PAGES */}
              <Route
                path="/tracksfullpage"
                element={
                  <PageWrapper>
                    <TracksFullPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/albumsfullpage"
                element={
                  <PageWrapper>
                    <AlbumsFullPage />
                  </PageWrapper>
                }
              />
              <Route
                path="/artistsfullpage"
                element={
                  <PageWrapper>
                    <ArtistsFullPage />
                  </PageWrapper>
                }
              />

            </Routes>


          </AnimatePresence>
        </div>
      </Layout>

      <LoginDrawer />
    </LoginProvider>
  );
}

export default App;
