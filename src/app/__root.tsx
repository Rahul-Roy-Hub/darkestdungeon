import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Analytics } from '@vercel/analytics/next';
import { ProviderTree } from '~/providers';

import '../styles/globals.css';

const RootComponent = () => {
  return (
    <>
      {import.meta.env.MODE === 'development' && (
        <TanStackRouterDevtools position='bottom-right' />
      )}
      <ProviderTree>
        <Outlet />
      </ProviderTree>
      <Analytics />
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
