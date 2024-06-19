import React, { useState } from 'react';

export function Counter() {
    const [counter, setCounter] = useState(0);


    const onButttonClick = () => {
        setCounter(counter + 1);
        console.log("Pressed");
    };

    return (
    <div>
        <p>Counter is {counter}</p>
        <button onClick={onButttonClick}>PressMe</button>
    </div>
    );
}

// class MyCompomemt extens Rc.TextComponent{
//     render() {

//     }
// }