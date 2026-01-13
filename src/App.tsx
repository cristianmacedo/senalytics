import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Statistics } from '@/pages/Statistics';
import { Simulator } from '@/pages/Simulator';
import { History } from '@/pages/History';

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
