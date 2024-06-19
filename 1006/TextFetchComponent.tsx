import React, { useState } from 'react';

export function TextFetchComponent(props : {showToggleButton : boolean}) {
    const [fetchedText, setFetchedText] = useState({
        text: ['A', 'B']
    });
    const [showText, setShowText] = useState(false);

    function onFetchedTextDisplayToogle() {
        setShowText(!showText);
    }

    async function onFetchTextButtonClick(){
        const url = 
        'https://raw.githubusercontent.com/ebookapp/ebookapp.github.io/main/photo-recovery.json'
        const response = await fetch(url);
        const data: string = await response.text(); 
        const Lines = data.split(' ');
        console.log(data);
        
        setTimeout(() => {
            setFetchedText({text: Lines});
        }, 3000);
        //
    }

    // const myStyle = {
    //     color: 'red',
    //     animation: 'transition opacity 1s ease-out;'
    // };

    function displayFechedText() {
        return fetchedText.text.map((text) => {
            return (
            <div>
                <p>{text}</p>
            </div>
            );
        });
    }

    return (
    <div>
        {props.showToggleButton ? (
            <button onClick={onFetchedTextDisplayToogle}>
            {' '}
            Display {'->'} {showText ? 'off': 'on'} on/off</button>
        ) : (
            <></>
        )}
        
        {showText ? displayFechedText(): <></>}
        <button onClick={onFetchTextButtonClick}>Fetch me</button>
    </div>
    );
}