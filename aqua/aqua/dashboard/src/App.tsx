import { Routes, Route, Navigate } from 'react-router-dom';
import { AppStoreProvider } from './store/useAppStore';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Architect } from './pages/Architect';
import { Agents } from './pages/Agents';
import { Skills } from './pages/Skills';
import { Config } from './pages/Config';
import { Generate } from './pages/Generate';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AppStoreProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/architect" element={<Architect />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/config" element={<Config />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppStoreProvider>
  );
}

export default App;
