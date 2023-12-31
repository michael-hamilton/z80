import React from 'react';
import { createRoot } from 'react-dom/client';
import Debugger from './debugger';

const root = createRoot(document.getElementById('root'));

root.render(<Debugger />);
