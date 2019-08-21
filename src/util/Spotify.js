let accessToken = '';
const clientId = 'b52369d184a14f83943428010f38092a';
const redirectUri = 'http://localhost:3000/';

const Spotify = {
  
  getAccessToken() {
    // if there is an accessToken, return it
    if (accessToken) return accessToken;
    
    // check for access token and expiration in url
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    
    if (accessTokenMatch && expiresInMatch) {
      // why are they access token[1]?????
      console.log(accessTokenMatch);
      console.log(expiresInMatch);
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      
      // clear the accessToken after it expires
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      // if no access token in url, redirect user to authoriztion endpoint
      const accessUrl = 
            'https://accounts.spotify.com/authorize?client_id=' +
            clientId +
            '&response_type=token&scope=playlist-modify-public&redirect_uri=' +
            redirectUri;
      window.location = accessUrl;
    }
  },
  
  search(term) {
    console.log(`Spotify.search() search term: ${term}`);
    const accessToken = Spotify.getAccessToken();
    
    console.log(`Spotify.search() access token: ${accessToken}`);
    const searchEndpoint = 'https://api.spotify.com/v1/search?type=track&q=';
    
    return fetch(`${searchEndpoint}${term}`, {
      headers: {
       Authorization: `Bearer ${accessToken}`
      }
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      if (!jsonResponse.tracks) return [];
      
      //**** wrap response object in parameters*****//
      return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
      }));
    });
  },
  
  savePlaylist(name, trackUris) {
    if (!name || !trackUris) return;
    
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;
    const userEndpoint = 'https://api.spotify.com/v1/me'
    
    return fetch(userEndpoint, {
      headers: headers
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      userId = jsonResponse.id;
      console.log(userId);
      const newPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
      return fetch(newPlaylistEndpoint, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
      })
      .then(response => {
        return response.json();
      })
      .then(jsonResponse => {
        const playlistId = jsonResponse.id;
        const addToPlaylistEndpoint = `https://api.spotify.com/v1/users/{user_id}/playlists/${playlistId}/tracks`;
        return fetch(addToPlaylistEndpoint, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify( {uris: trackUris })
        });
      });
    });
  } 
};

export default Spotify;