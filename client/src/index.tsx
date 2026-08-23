import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import { AppContainer } from '@lark-apaas/client-toolkit/components/AppContainer';
import { ErrorRender } from '@lark-apaas/client-toolkit/components/ErrorRender';

import RoutesComponent from './app.tsx';
import './index.css';
import { createPortal } from 'react-dom';
import { Toaster } from '@client/src/components/ui/sonner';

// 纯静态部署（GitHub Pages 等）时由 vite.preview.config.ts 注入 __LOCAL_PREVIEW__ = true，
// 绕开依赖平台后端 API/鉴权的 AppContainer；妙搭平台构建（原 vite.config.ts）不注入该开关，
// 走 AppContainer，行为与之前完全一致。
const inner = (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <ErrorRender
        error={error as Error}
        resetErrorBoundary={resetErrorBoundary}
      />
    )}
  >
    <RoutesComponent />
    {createPortal(<Toaster />, document.body)}
  </ErrorBoundary>
);

const MainApp = () => {
  return (
    <HashRouter>
      {typeof __LOCAL_PREVIEW__ !== 'undefined' && __LOCAL_PREVIEW__ ? (
        inner
      ) : (
        <AppContainer defaultTheme="light">{inner}</AppContainer>
      )}
    </HashRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
