import React from 'react';
import { createRoot } from 'react-dom/client';
import AppComponent from '@/components/App'; // thanks to alias field in the resolve object 

createRoot(document.getElementById('root')).render(<AppComponent />);
