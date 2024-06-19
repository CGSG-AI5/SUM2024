import React, { useState } from 'react';

export function TextFetchComponent() {
    const [fetchedText, setFetchedText] = useState([
        {
           login: '',
           url_login: '',
           repository_name: '',
           url_repository: '',
           description: '',
           image: ''
        }
    ]);
    const [showText, setShowText] = useState(false);
    const [Isfound, setIsfound] = useState(false);

    const [name, setName] = useState(' ');

    function onFetchedTextDisplayToogle() {
        setShowText(!showText);
    }

    async function onFetchTextButtonClick(){
        const Str = [
            {
                login: '',
                url_login: '',
                repository_name: '',
                url_repository: '',
                description: '',
                image: ''
            }
        ];
        Str.length = 0;
        let page = 1;
        while(true){
            const url = 
            'https://api.github.com/search/repositories?q=' + name + "&page=" + page++;
            const response = await fetch(url);
            const data: any = await response.json(); 

            if (data["items"] ==  undefined)
                break;
            const li = data["items"];

            for (let element of li){
                Str.push({login: element["owner"]["login"], url_login: element["owner"]["html_url"], repository_name: element["full_name"], url_repository: element["html_url"],
                    description:element["description"], image:element["owner"]["avatar_url"]})
            }
         } 
        
        setTimeout(() => {
            setFetchedText(Str);
            setShowText(true);
            if (Str.length != 0)
                setIsfound(true);
            else
                setIsfound(false);
        }, 3000);
        //
    }

    // const myStyle = {
    //     color: 'red',
    //     animation: 'transition opacity 1s ease-out;'
    // };

    function displayNumberResult() {
        if (Isfound)
        {
            return (
                <div>
                    <p>Number of results: {fetchedText.length}</p>
                </div>  
            );
        }
        else
        {
            return (
                <div>
                    <p>Nothing found</p>
                </div>  
            );  
        }
    }

    function displayFechedText() {
        return fetchedText.map((text) => {
            return (
            <div>
                <p>Login: <a href={text.url_login}>{text.login}</a></p>
                <p>Repository: <a href={text.url_repository}>{text.repository_name}</a></p>
                <p>Description: {text.description}</p>
                <img src={text.image}/>
            </div>
            );
        });
    }

    function handleChange(event : any) {
        setName(event.target.value);
        console.log(name);
    }


    return (
        <div>
           <p>Search repositories in github</p>
           <input type="text" key="01" name="kye" value={name} onChange={handleChange}/><button key="02" onClick={onFetchTextButtonClick}>Search</button>
           {showText ? displayNumberResult() : <></>}
           {showText && Isfound? displayFechedText(): <></>}   
        </div>    
    );
}