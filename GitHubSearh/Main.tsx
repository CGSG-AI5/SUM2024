import React from 'react';
import {createRoot} from 'react-dom/client'
import { Counter } from "./Counter"

import { TextFetchComponent } from "./TextFetchComponent"


function TextComponent() {
    return (<div><p>SomeText</p></div>);
}

async function onLoad()
 {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;
    const root = createRoot(rootElement); 
    root.render(
    <div>
        <TextFetchComponent></TextFetchComponent>
    </div>
    );
}

window.onload = onLoad;