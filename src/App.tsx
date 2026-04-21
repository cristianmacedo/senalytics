import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { LoadingPage } from "@/components/ui/Loading";

const Home = lazy(() =>
  import("@/pages/Home").then((module) => ({ default: module.Home }))
);
const Statistics = lazy(() =>
  import("@/pages/Statistics").then((module) => ({
    default: module.Statistics,
  }))
);
const Simulator = lazy(() =>
  import("@/pages/Simulator").then((module) => ({ default: module.Simulator }))
);
const History = lazy(() =>
  import("@/pages/History").then((module) => ({ default: module.History }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
