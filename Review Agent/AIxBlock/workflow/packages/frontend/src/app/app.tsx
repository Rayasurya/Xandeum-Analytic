import {
  DefaultErrorFunction,
  SetErrorFunction,
} from '@sinclair/typebox/errors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { EmbeddingProvider } from '@/components/embed-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar-shadcn';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import '@/i18n';
import { EmbeddingFontLoader } from './components/embedding-font-loader';
import { InitialDataGuard } from './components/initial-data-guard';
import { ApRouter } from './router';

import "./../styles/styles.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  }
});
let typesFormatsAdded = false;

if (!typesFormatsAdded) {
  SetErrorFunction((error) => {
    return error?.schema?.errorMessage ?? DefaultErrorFunction(error);
  });
  typesFormatsAdded = true;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EmbeddingProvider>
        <InitialDataGuard>
          <EmbeddingFontLoader>
              <TooltipProvider>
                <ThemeProvider storageKey="vite-ui-theme">
                  <SidebarProvider>
                    <ApRouter />
                    <Toaster />
                  </SidebarProvider>
                </ThemeProvider>
              </TooltipProvider>
          </EmbeddingFontLoader>
        </InitialDataGuard>
      </EmbeddingProvider>
    </QueryClientProvider>
  );
}

export default App;
