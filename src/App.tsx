import { BaseMap } from './BaseMap';
import { BRAND_CONFIG } from './config/brandConfig';

interface AppProps {
  appTitle?: string;
  footerLabel?: string;
  companyName?: string;
}

function App({
  appTitle = BRAND_CONFIG.appTitle,
  footerLabel = BRAND_CONFIG.footerLabel,
  companyName = BRAND_CONFIG.companyName
}: AppProps) {
  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-background font-sans px-5 py-10">
      <h1 className="text-primary mb-5 text-2xl font-bold">{appTitle}</h1>
      <BaseMap />
      <p className="mt-5 text-secondary text-sm">
        {footerLabel} - {companyName}
      </p>
    </div>
  );
}

export default App;