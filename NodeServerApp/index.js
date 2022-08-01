const express = require('express')
const https = require('https');
const app = express();
const port = 3000;

let tokenQuery;

const endpoints = {
    auth: 'https://accounts.spotify.com/authorize',
    token: 'https://accounts.spotify.com/api/token',
    base: 'https://api.spotify.com/v1',
    nowPlaying: 'me/player/currently-playing',
    getAlbums: 'albums',
    getTracks: 'tracks',
    nextTrack: 'me/player/next',
    playbackQueue: 'me/player/queue'
}

// This is a hacky workaround to ensure that the queue does not get skipped into oblivion
// There really is no way (as of right now July 2022) with the web playback API to get the user's queue
const LIMIT_SKIP_AMOUNT = 20;

async function getCurrentSong() {
    const currentlyPlayingResponse = await fetch(`${endpoints.base}/${endpoints.nowPlaying}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${tokenQuery}`
        }
    })

    return await currentlyPlayingResponse.json();

}

async function skipTracks(trackUriCode = null) {
    const trackUriCodeParsed = trackUriCode.replace('track:', "");
    let skippedTrackCounter = 0;
    // if no track is defined keep skipping until queue is cleared
    while (true) {
        let currentlyPlayingData = await getCurrentSong();
        if (skippedTrackCounter == 1) {
            setTimeout(function () {
                currentlyPlayingData = getCurrentSong();
            }, 2000);
        }
        console.log("Currently Playing:", currentlyPlayingData.item.name);

        if (currentlyPlayingData.item.id == trackUriCodeParsed || skippedTrackCounter == LIMIT_SKIP_AMOUNT) {
            break;
        }
        const nextTrackresponse = await fetch(`${endpoints.base}/${endpoints.nextTrack}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${tokenQuery}`
            }
        })
        skippedTrackCounter++;
    }
}


async function addTrackToQueue(trackUriCode) {
    let trackUriPrefix = 'spotify:'
    if (!trackUriCode.match('^track'))
        trackUriPrefix += "track:"
    return await fetch(
        `${endpoints.base}/${endpoints.playbackQueue}?uri=${trackUriPrefix}${trackUriCode}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${tokenQuery}`
            }
        }
    )

}

app.get('/', async (req, res) => {
    res.send('id: ' + req.query.id);
    const trackUriCode = req.query.id;
    if (tokenQuery && trackUriCode) {
        // ALBUM CASE
        if (trackUriCode.match('^album')) {
            const albumCodeURIParsed = trackUriCode.replace('album:', "");
            const albumTrackResponse =
                await fetch(`${endpoints.base}/${endpoints.getAlbums}/${albumCodeURIParsed}/${endpoints.getTracks}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${tokenQuery}`
                    }
                })
            if (!albumTrackResponse.ok) {
                throw new Error(`An error has occured: ${albumTrackResponse.status}`)
            } else {
                const albumDetails = await albumTrackResponse.json()
                // add all the tracks in the album to the queue
                // note I think the limitation on this is set to 20 tracks
                // as a future todo I will explore making this work with albums 
                // which have 20+ tracks or multiple parts
                albumDetails.items.forEach(track => {
                    addTrackToQueue(track.id);
                });
                // skip to the very first track of the album
                skipTracks(albumDetails.items[0].id);
            }

        } else {
            // TRACK CASE
            const trackUriCodeParsed = trackUriCode.replace('track:', "");
            const response = await addTrackToQueue(trackUriCodeParsed);
            if (!response.ok)
                throw new Error(`An error has occured: ${response.status}`)
            else
                skipTracks(trackUriCode);
        }
    }

});

app.post('/tokenPost', function (req, res) {
    console.log("Token updated");
    tokenQuery = req.query.token;
});









app.listen(port, () => {
    console.log(`Spotify Node Server App is now listening on port ${port}!`)
    console.log(`Don't forget to start the React Auth App and login.`)
});
