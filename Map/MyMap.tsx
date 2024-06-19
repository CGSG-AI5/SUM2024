import React, { useState } from 'react';
import Map, {Popup, Marker} from './node_modules/react-map-gl/dist/es5/exports-maplibre';


export function MyMap() {
  const [lat, setLat] = useState(59.943275446853335);
  const [long, setLong] = useState(30.277781845646587);
  const [showPopup, setShowPopup] = useState(false);
  const [temperature, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);


  async function onClick(e: any){
    if (!showPopup)
    {
      
        console.log(e.lngLat);
        setLong(e.lngLat.lng);
        
        setLat(e.lngLat.lat);
        const url ='https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&exclude=current&appid=83ff7c351807ba7c08f5dd2e7e3cced1'
        const response = await fetch(url);
        const data: any = await response.json(); 

        setTimeout(() => {
          setTemp(data["main"]["temp"] - 273);
          setHumidity(data["main"]["humidity"]);          
          setShowPopup(true);
      }, 500);
    }
  }


  return (
    
    <Map initialViewState={{longitude: 30.277781845646587, latitude:  59.943275446853335, zoom: 20}}
    style={{position:"absolute", top:"0", left:"0", bottom:"0", right:"0"}}
    onClick={onClick}
    mapStyle='https://api.maptiler.com/maps/streets/style.json?key=RQwagRdxb3DohwBwgMPj'> 
      {showPopup && 
       (<Popup longitude={long} style={{position:"absolute", top:"0", left:"0"}} latitude={lat}
        onClose={() => setShowPopup(false)}  
        anchor='bottom'
        focusAfterOpen={false}>
        Lat = {lat},<br />
        Long = {long}<br />
        {temperature.toFixed(1)} °C <br />
        humidity: {humidity}% <br />
        </Popup>)}        
    </Map>
  );
}
  //onClose={() => setShowPopup(false)}>        position:'absolute',
        // top:"0",
        // left:"0",
        // right:"0",
        // bottom:"0",  (    
       // <Marker longitude={long} style={{position:"absolute", top:"0", left:"0",}} latitude={lat} anchor="bottom" ></Marker>
       //
      //  <p><img width="20px" height="20px" src={'http://openweathermap.org/img/wn/03d@2x.png'}/></p>
        