
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Preload Google Fonts para melhorar performance
const fontStylesheet = document.createElement('link');
fontStylesheet.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
fontStylesheet.rel = 'stylesheet';
document.head.appendChild(fontStylesheet);

createRoot(document.getElementById("root")!).render(<App />);
