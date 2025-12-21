import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { LoginProvider } from "./features/auth/components/LoginProvider";
import LoginDrawer from "./features/auth/components/LoginDrawer";

import Layout from "./components/shared/Layout";
import Header from "./components/header/Header";
import PageWrapper from "./components/shared/PageWrapper";

// Pages
import LibraryPlaylists from "./pages/library/LibraryPlaylists";
import LibraryTracks from "./pages/library/LibraryTracks";
import LibraryAlbums from "./pages/library/LibraryAlbums";

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
import Dashboard from "./pages/discovery/Dashboard";
import CommunityActivity from "./pages/discovery/CommunityActivity";
import ForYou from "./pages/discovery/ForYou";

import { ErrorProvider } from "./context/ErrorContext";
import ErrorMessage from "./components/ui/ErrorMessage";
import { SuccessProvider } from "./context/SuccessContext";
import SuccessMessage from "./components/ui/SuccessMessage";
import MobileWarning from "./components/ui/MobileWarning";
import { ConfirmationProvider } from "./context/ConfirmationContext";

//new added for UserProfile
import UserProfile from "./features/user/user_pages/UserProfile";

function App() {
  const location = useLocation();
  return (
    <ErrorProvider>
      <SuccessProvider>
        <ConfirmationProvider>
          <ErrorMessage />
          <SuccessMessage />
          <MobileWarning />
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



                    {/* INFO */}
                    <Route
                      path="/info"
                      element={
                        <PageWrapper>
                          <Info />
                        </PageWrapper>
                      }
                    />

                    {/* DISCOVERY --------------------- */}
                    <Route path="/discovery">
                      <Route
                        path="dashboard"
                        element={
                          <PageWrapper>
                            <Dashboard />
                          </PageWrapper>
                        }
                      />
                      <Route
                        path="community-activity"
                        element={
                          <PageWrapper>
                            <CommunityActivity />
                          </PageWrapper>
                        }
                      />
                      <Route
                        path="for-you"
                        element={
                          <PageWrapper>
                            <ForYou />
                          </PageWrapper>
                        }
                      />
                    </Route>

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

                    {/* ADDED PROFILE ROUTES  */}

                    {/* USER PROFILE PUBLIC PAGES */}
                    <Route
                      path="/profile/:userId"
                      element={
                        <PageWrapper>
                          <UserProfile />
                        </PageWrapper>
                      }
                    />

                    {/* DONE ADDED */}

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
        </ConfirmationProvider>
      </SuccessProvider>
    </ErrorProvider>
  );
}

export default App;