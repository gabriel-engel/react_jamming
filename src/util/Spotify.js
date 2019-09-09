const clientId = 'b52369d184a14f83943428010f38092a';
//const redirectUri = 'http://gabriel-engel-react-jamming.surge.sh/';
const redirectUri = 'http://localhost:3000/';
let accessToken = '';
let userId = '';

const Spotify = {
  
  checkAuthentication() {
    return accessToken
  },
  
  checkSecretNumber(number) {
    const cookieSecretNumber = document.cookie.match(/secretNumber=([^;]*)/)[1];

    return cookieSecretNumber === number ? true : false;

  },
  
  getAccessToken(term) {
    // if there is an accessToken, return it
    if (accessToken) return accessToken;
    
    // retrieve hash values if present
    const hashValues = this.processRedirectUriHash();
    console.log(hashValues);
    
    if (hashValues.accessToken && hashValues.expiration && hashValues.secretNumber) {
      // if the secret number returned doeesn't match browser's cookie, don't store accessToken
      if (!this.checkSecretNumber(hashValues.secretNumber)) return;
      
      accessToken = hashValues.accessToken;
      
      // remove hash after store search term in history state
      window.history.pushState('Access Token Obtained', null, '/');
      
      // clear the accessToken after it expires
      window.setTimeout(() => accessToken = '', hashValues.expiration * 1000);
      window.setTimeout(() => console.log('its been 1 second'), 1000);
      
      return accessToken;
    } else {
      // if no access token in url, redirect user to authoriztion endpoint
      const scope = 'scope=playlist-modify-public%20playlist-modify-private%20playlist-read-private';
      
      // for security, create a secret random 4 digit number
      const secretNumber = Math.floor(Math.random() * 10000);
      
      // set a cookie for the secret number so it is retrievable after URL changes and expires after 1 day
      document.cookie = `secretNumber=${secretNumber}; expires=${new Date(Date.now()+1000*60*60*24)}; path=/`;
      
      const accessUrl = 
            'https://accounts.spotify.com/authorize?client_id=' +
            clientId +
            '&response_type=token&' +
            scope +
            '&redirect_uri=' +
            redirectUri +
            `&state=${secretNumber}${term}`;
      
      window.location.href = accessUrl;
    }
  },
  
  processRedirectUriHash() {
    // if there is no hash, return empty object
    if (!window.location.hash) return {};
    
    // if there is a hash, return an object with hash values as properties
    const accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
    const expiration = Number(window.location.href.match(/expires_in=([^&]*)/)[1]);
    const state = window.location.href.match(/state=([^&]*)/)[1];
    const secretNumber = state.slice(0, 4);
    const searchTerm = state.slice(4);
        
    return {
      accessToken,
      expiration,
      secretNumber,
      searchTerm
    };
  },
  
  getUserId() {
    if (userId) return userId;
    
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const userEndpoint = 'https://api.spotify.com/v1/me'
    
    return fetch(userEndpoint, {
      headers: headers
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      userId = jsonResponse.id;
      return userId;
    });
  },
  
  search(term) {
    const accessToken = Spotify.getAccessToken(term);
    const searchEndpoint = 'https://api.spotify.com/v1/search?type=track&q=';
    console.log(searchEndpoint);
    console.log(term);
    
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
      
      let position = 0;
      
      return jsonResponse.tracks.items.map(track => {
        // same format as getPlaylistTracks() track list
        return {
          position: position++,
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
          fromPlaylist: false,
          imageUrl: track.album.images[2].url
        }  
      });
    });
  },
  
  async getUserPlaylists() {
    
    const accessToken = await Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const userId = await Spotify.getUserId();
    const getUserPlaylistsEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
    return fetch(getUserPlaylistsEndpoint, {
      headers: headers
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      if (!jsonResponse.items) return [];

      return jsonResponse.items.map(playlist => {
        return {
          id: playlist.id,
          name: playlist.name,
          public: playlist.public,
          uri: playlist.uri,
        }
      });
    })
  },
  
  async getPlaylistTracks(playlistId) {
    if (!playlistId) return [];
    
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const getPlaylistTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    
    return fetch(getPlaylistTracksEndpoint, {
      headers: headers
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      
      let position = 0;
      
      return jsonResponse.items.map(track => {
                
        // same format as search() track list
        console.log(`retrieved playlist track: ${track.track.name}`);
        return {
          position: position++,
          id: track.track.id,
          name: track.track.name,
          artist: track.track.artists[0].name,
          album: track.track.album.name,
          uri: track.track.uri,
          fromPlaylist: true,
          imageUrl: track.track.album.images[2].url
        }
      })
    });
  },
  
  createNewPlaylist(headers, userId, name) {
    const createNewPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
    
    return fetch(createNewPlaylistEndpoint, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({name: name})
    })
    .then(response => {
      return response.json();
    });
  },
  
  deletePlaylist(playlistId) {
    
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const deletePlaylistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;
    
    return fetch(deletePlaylistEndpoint, {
      headers: headers,
      method: 'DELETE',
    })
  },
  
  changePlaylistName(headers, id, name) {
    
    console.log(headers);
    console.log(id);
    console.log(name);
    const changePlaylistNameEndpoint = `https://api.spotify.com/v1/playlists/${id}`
    
    headers["Content-Type"] = "application/json";
    
    return fetch(changePlaylistNameEndpoint, {
      headers: headers,
      method: 'PUT',
      body: JSON.stringify( {name: name} )
    });
  },
  
  addTracksToPlaylist(headers, id, newTrackUris) {
    
    const addToPlaylistEndpoint = `https://api.spotify.com/v1/playlists/${id}/tracks`;
    
    return fetch(addToPlaylistEndpoint, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify( {uris: newTrackUris} )
    });
  },
  
  removeTracksFromPlaylist(headers, id, deleteTrackUris) {
    
    const removeFromPlaylistEndpoint = `https://api.spotify.com/v1/playlists/${id}/tracks`
    
    return fetch(removeFromPlaylistEndpoint, {
      headers: headers,
      method: 'DELETE',
      body: JSON.stringify( {uris: deleteTrackUris})
    });
  },
  
  // saves new playlists or updates existing ones
  async savePlaylist(id, name, newTrackUris, deleteTrackUris, newName) {
    console.log(`saving playlist id: ${id} name: ${name}`);
    console.log('new tracks:');
    console.log(newTrackUris);
    console.log('deleting tracks:');
    console.log(deleteTrackUris);
    console.log(`new name?: ${newName}`);
    
    if (!name || !newTrackUris || !deleteTrackUris) return;
    
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const userId = await Spotify.getUserId();
    
    // if it is a new playlist, create a new playlist and save its id
    if (!id) {
      id = await Spotify.createNewPlaylist( headers, userId, name)
      .then(jsonResponse => {
        return jsonResponse.id;
      });
    }
    
    
    if (newName) {
       await Spotify.changePlaylistName(headers, id, name);
    }
    
    // add tracks to the playlist
    if (newTrackUris.length > 0) {
      await Spotify.addTracksToPlaylist(headers, id, newTrackUris);
    } 
    
    // remove tracks from the playlist
    if (deleteTrackUris.length > 0) {
      await Spotify.removeTracksFromPlaylist(headers, id, deleteTrackUris);
    }
  }
};

export default Spotify;