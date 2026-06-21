import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LangProvider } from './i18n/LangContext';

import Splash from './screens/Splash';
import Login from './screens/Login';
import Main from './screens/Main';
import OnboardingInstructions from './screens/OnboardingInstructions';
import OnboardingVideo from './screens/OnboardingVideo';
import OnboardingTelegram from './screens/OnboardingTelegram';

function App() {
  const location = useLocation();

  return (
    <LangProvider>
      <div className="app-container">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding-1" element={<OnboardingInstructions />} />
            <Route path="/onboarding-2" element={<OnboardingVideo />} />
            <Route path="/onboarding-3" element={<OnboardingTelegram />} />
            <Route path="/main/*" element={<Main />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </LangProvider>
  );
}

export default App;
