import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import { Layout } from '@/components/layout';
import { Overview } from '@/pages/overview';
import { Companies } from '@/pages/companies';
import { Tasks } from '@/pages/tasks';
import { Interviews } from '@/pages/interviews';
import { CoverLetters } from '@/pages/cover-letters';
import { Certificates } from '@/pages/certificates';
import { PortfolioPage } from '@/pages/portfolio';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Layout>
        <Switch>
          <Route path="/" component={Overview} />
          <Route path="/companies" component={Companies} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/interviews" component={Interviews} />
          <Route path="/cover-letters" component={CoverLetters} />
          <Route path="/certificates" component={Certificates} />
          <Route path="/portfolio" component={PortfolioPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
