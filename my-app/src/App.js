import React from 'react'

import './App.css';
import { SpotifyApiContext } from 'react-spotify-api'
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css' // if using the included styles
import Cookies from 'js-cookie'




function App() {
  const [token, setToken] = React.useState(Cookies.get("spotifyAuthToken"))

  return (
    <div className='app'>
      {token ? (
        <SpotifyApiContext.Provider value={token}>
          {/* Your Spotify Code here */}
          <p>You are authorized with token: {token}</p>
        </SpotifyApiContext.Provider>
      ) : (
        // Display the login page
        <SpotifyAuth
          redirectUri='http://localhost:3000/callback'
          clientID='8fe16d0e58934415a6fa4fbc934c4944'
          scopes={[Scopes.userReadPrivate, 'user-read-email']} // either style will work
          onAccessToken={(token) => setToken(token)}
        />
      )}
    </div>

  );
}

export default App;
