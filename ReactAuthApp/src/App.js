import React, { useState, useEffect } from 'react';
import './App.css';
import { SpotifyApiContext } from 'react-spotify-api'
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css' // if using the included styles
import Cookies from 'js-cookie'


async function updateFunction(token) {
  const response =
    await fetch(
      `http://192.168.0.20:3000/tokenPost?token=${token}`,
      {
        method: 'POST',
      }
    )
  if (!response.ok) {
    console.log(response);
    throw new Error(`An error has occured: ${response.status}`)
  }
}

function App() {

  const [token, setToken] = useState(Cookies.get("spotifyAuthToken"))

  useEffect(() => {
    if (token) {
      updateFunction(token);
    }
  }, [token])


  return (
    <div cLassName='app'>
      {token ? (
        <SpotifyApiContext.Provider value={token}>
          <div className='login-prompt'>

            <p className='login-confirmation'>You are authorized with a token</p>
            <div className='login-button-wrapper'>
              <a href="/">
                <button className='log-out-button' onClick={() => {
                  console.log(Cookies)
                  document.cookie = "spotifyAuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                }}>Home</button>
              </a>
            </div>
          </div>
        </SpotifyApiContext.Provider>
      ) : (
        <div className='login-prompt'>

          <div className='login-button-wrapper'>
            <SpotifyAuth
              btnClassName="spotify-login-button"
              redirectUri='http://192.168.0.20:3032/callback'
              clientID={process.env.REACT_APP_SPOTIFY_CLIENT_ID}
              scopes={[Scopes.userReadPrivate, 'user-read-email', Scopes.userModifyPlaybackState, Scopes.userReadCurrentlyPlaying]}
              onAccessToken={(token) => setToken(token)}
            />
          </div>
          <div className='repo-details'>
            <p>Spotify NFC Reader and App by <a target="_blank" rel="noreferrer" href='https://keshavchawla.com/'>Keshav Chawla</a></p>
            <p>Built with the <a target="_blank" rel="noreferrer" href='https://www.npmjs.com/package/react-spotify-auth'>react-spotify-auth package</a> by Kevin Jiang</p>
          </div>
        </div>
      )
      }
    </div >
  );
}

export default App;
