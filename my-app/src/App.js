import React, { useState, useEffect, useRef } from 'react';


import './App.css';
import { SpotifyApiContext } from 'react-spotify-api'
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css' // if using the included styles
import Cookies from 'js-cookie'

const endpoints = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token',
  base: 'https://api.spotify.com/v1',
  nowPlaying: 'me/player/currently-playing',
  nextTrack: 'me/player/next',
  playbackQueue: 'me/player/queue'
}


async function updateFunction(token, trackUICode) {
  console.log('CAALLS FUNCTION')
  const trackUriPrefix = 'spotify:track:'
  // const macDeviceId = '518df1284d6df12fe86be259dcc65e08a01ff841'

  const response =
    await fetch(
      `${endpoints.base}/${endpoints.playbackQueue}?uri=${trackUriPrefix}${trackUICode}`,

      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )


  /**
   * Fetch error.
   */
  if (!response.ok) {
    throw new Error(`An error has occured: ${response.status}`)
  } else {
    const responseNext =
      await
        fetch(`${endpoints.base}/${endpoints.nextTrack}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
  }

}

function App() {

  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"))

  const [uriCode, setUriCode] = useState('2eAvDnpXP5W0cVtiI0PUxV')
  const textRef = useRef();
  return (
    <div className='app'>
      {token ? (
        <SpotifyApiContext.Provider value={token}>
          {/* Your Spotify Code here */}
          <p>You are authorized with token: {token}</p>
          <button onClick={() => updateFunction(token, uriCode)}>CLICK TO START</button>
          {/* <form onSubmit={() => {
            console.log('uri code set to: ', textRef.current.value);
            setUriCode(textRef.current.value)
          }}> */}
          <label>
            <input type="text" ref={textRef} />
          </label>
          <button
            onClick={() => {
              console.log('uri code set to: ', textRef.current.value);
              setUriCode(textRef.current.value)
            }}
          >CLICK FOR UPDATE</button>


          {/* </form> */}

        </SpotifyApiContext.Provider>
      ) : (
        // Display the login page
        <SpotifyAuth
          redirectUri='http://localhost:3000/callback'
          clientID='8fe16d0e58934415a6fa4fbc934c4944'
          scopes={[Scopes.userReadPrivate, 'user-read-email']} // either style will work
          onAccessToken={(token) => setToken(token)}
        />
      )
      }
    </div >

  );
}

export default App;
