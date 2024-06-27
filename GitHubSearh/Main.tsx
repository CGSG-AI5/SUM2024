import React from 'react';
import {createRoot} from 'react-dom/client'
import { Counter } from "./Counter"

async function onLoad()
 {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;
    const root = createRoot(rootElement); 
    root.render(
    <div>
        <Counter></Counter>
    </div>
    );
}

window.onload = onLoad;