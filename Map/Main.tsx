import React from 'react';
import {createRoot} from 'react-dom/client'


import { MyMap } from "./MyMap"


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
        <MyMap></MyMap>
    </div>
    );
}

window.onload = onLoad;