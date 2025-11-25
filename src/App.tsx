import { useLocation, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/shared/Layout";
import Header from "./components/header/Header";
import PageWrapper from "./components/shared/PageWrapper";
import AnonHomePage from "./pages/anonhomepage";

function App() {
  const location = useLocation();

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header is persistent across pages in this layout */}
        <div className="shrink-0 z-40 sticky top-0">
          <Header />
        </div>

        {/* Animated Routes */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <AnonHomePage />
                </PageWrapper>
              }
            />
            <Route
              path="/library"
              element={
                <PageWrapper>
                  <AnonHomePage />
                </PageWrapper>
              }
            />
            <Route
              path="/songs"
              element={
                <PageWrapper>
                  <div className="text-2xl text-white">Songs Page Content</div>
                </PageWrapper>
              }
            />
            <Route
              path="/favourites"
              element={
                <PageWrapper>
                  <div className="text-2xl text-white">Favourites Page Content</div>
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