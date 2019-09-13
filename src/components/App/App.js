import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import PlaylistList from '../PlaylistList/PlaylistList';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      searchResults: [],
      playlistList: [],
      playlistTracks: [],
      playlistTracksToRemove: [],
      currentPlaylistList: false,
      playlistView: false,
      playlistName: '',
      playlistId: '',
      trackPreview: false,
      showDuplicateTracks: true
    }    
    
    this.search = this.search.bind(this);
    this.getUserPlaylists = this.getUserPlaylists.bind(this);
    this.getPlaylistTracks = this.getPlaylistTracks.bind(this);
    this.setPlaylistDetails = this.setPlaylistDetails.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.checkForNewPlaylistName = this.checkForNewPlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
    this.togglePlaylistView = this.togglePlaylistView.bind(this);
    this.toggleTrackPreview = this.toggleTrackPreview.bind(this);
    this.toggleDuplicateTrackVisibility = this.toggleDuplicateTrackVisibility.bind(this);
  }
    
  search(term) {
    Spotify.search(term)
    .then(searchResults => {
      this.setState({
        searchResults: searchResults
      });
    });
  }
    
  // get user playlist list and set currentPlaylistList state to true
  getUserPlaylists() {
    Spotify.getUserPlaylists()
    .then(userPlaylists => {
      console.log('getUserPlaylists and retrieve user playlists:')
      console.log(userPlaylists);
      this.setState({
        playlistList: userPlaylists,
        currentPlaylistList: true
      });
    });
  }
  
  // get playlist tracks and set playlist details after opened
  getPlaylistTracks(playlistId) {
    Spotify.getPlaylistTracks(playlistId)
    .then(playlistTracks => {
      console.log(`get playlist's tracks:`);
      console.log(playlistTracks);
      this.setState({
        playlistTracks: playlistTracks
      });
    })
    
    // set playlist details
    this.setPlaylistDetails(playlistId);
  }
  
  setPlaylistDetails(playlistId) {
    for (let playlist of this.state.playlistList) {
      if (playlist.id === playlistId) {
        this.setState({
          playlistId: playlist.id,
          playlistName: playlist.name
        });
      }
    }
  }
  
  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    });
  }
  
  addTrack(key) {
    const tracks = this.state.playlistTracks;
    
    /* for hide duplicates
    // if the track is in the playlist, exit method
    if (tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    */
    const track = this.state.searchResults[key];
    
    tracks.push(track);
    
    this.setState({
      playlistTracks: tracks
    });
  }
  
  removeTrack(key) {
    
    const tracks = this.state.playlistTracks;
    
    const reducedTracks = tracks.filter((track, index) => index !== key);
    
    this.setState({
      playlistTracks: reducedTracks
    });
  }
  
  // did the user change the playlists name?
  checkForNewPlaylistName() {
    for (let playlist of this.state.playlistList) {
      if (playlist.id === this.state.playlistId) {
        if (playlist.name !== this.state.playlistName) {
          return true;
        }
      }
    }
    return false;
  }
  
  savePlaylist() {
    
    let tracks = this.state.playlistTracks;
    
    if (!this.state.showDuplicateTracks) {
      const permission = window.confirm('Hidden duplicate tracks will be lost, proceed?');
      if (permission === false) return;
      tracks = tracks.filter(track => track.visible);
    }
      
    const trackUris = tracks.map(track => track.uri)
    const newName = this.checkForNewPlaylistName();
    
    Spotify.savePlaylist(this.state.playlistId, this.state.playlistName, trackUris, newName)
    .then( () => {
      
      // refresh playlistList if necessary
      if (!this.state.playlistId || newName) {
        this.getUserPlaylists();
      }
    })
    .then( () => {
      // reset playlist view and details
      this.setState({
        playlistId: '',
        playlistName: '',
        playlistTracks: [],
        playlistView: false,
      });
    });
  }
  
  deletePlaylist(playlistId) {
    Spotify.deletePlaylist(playlistId)
    .then(() => this.getUserPlaylists());
  }
  
  renderSearchResults() {
    if (Spotify.checkAuthentication()) {      
      return (
        <SearchResults
        searchResults={this.state.searchResults}
        onAdd={this.addTrack}
        isRemoval={false}
        trackPreview={this.state.trackPreview} />
      )
    }
  }
  
  renderPlaylistList() {
    if (!this.state.playlistView && Spotify.checkAuthentication()) {
      // if there is no current playlist, load it first
      if (!this.state.currentPlaylistList) {
        this.getUserPlaylists();
      }

      return (
        <PlaylistList
        playlistList={this.state.playlistList}
        onOpen={this.togglePlaylistView}
        onDelete={this.deletePlaylist} />
      )
    }
  }
  
  renderPlaylist() {
    if (this.state.playlistView && Spotify.checkAuthentication()) {    
      return (
        <Playlist
          onBack={this.togglePlaylistView}
          playlistName={this.state.playlistName}
          playlistTracks={this.state.playlistTracks}
          onRemove={this.removeTrack}
          isRemoval={true}
          onNameChange={this.updatePlaylistName}
          onSave={this.savePlaylist}
          trackPreview={this.state.trackPreview} />
      )
    }
  }
  
  togglePlaylistView(playlistId) {
    console.log('toggle');
    // load existing playlist's tracks or start fresh with new playlist
    if (playlistId) {
      this.getPlaylistTracks(playlistId);
    } else {
      this.setState({
        playlistTracks: [],
        playlistName: ''
      });
    }
    
    this.setState({
      playlistView: !this.state.playlistView
    });
  }
  
  toggleTrackPreview() {
    this.setState({
      trackPreview: !this.state.trackPreview
    });
  }
  
  toggleDuplicateTrackVisibility() {
    
    const visible = this.state.showDuplicateTracks;
    const results = this.state.searchResults;
    const tracks = this.state.playlistTracks;
    
    if (visible) {
      // hide search results that are in playlist
      for (let result of results) {
        for (let track of tracks) {
          if (result.id === track.id) {
            result.visible = false;
            break;
          }
        }
      }

      // hide reapeat occurences of a track in the playlist
      // cycle through each track
      for (let i = 0; i < tracks.length; i++) {
        // compare to remaining tracks
        for (let j = i + 1; j < tracks.length; j++) {
          // if a match is found later, make it invisible
          if (tracks[i].id === tracks[j].id) {
            tracks[j].visible = false;
          }
        }
      }
    } else {
      
      for (let result of results) {
        result.visible = true;
      }
      
      for (let track of tracks) {
        track.visible = true;
      }
    }
        
    this.setState({
      showDuplicateTracks: !this.state.showDuplicateTracks,
      searchResults: results,
      playlistTracks: tracks
    });
  }
      
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar
            onSearch={this.search} />
          <div className="App-options">
            <button
              className="App-option"
              onClick={this.toggleTrackPreview} >
            Track Preview: {this.state.trackPreview ? "on" : "off"}
            </button>
            <button
              className="App-option"
              onClick={this.toggleDuplicateTrackVisibility} >
            Show Duplicate Tracks: {this.state.showDuplicateTracks ? "on" : "off"}
            </button>
          </ div>
          <div className="App-lists">
            {this.renderSearchResults()}
            {this.renderPlaylistList()}
            {this.renderPlaylist()}
          </div>
        </div>
      </div>
    );
  }
  
  componentDidMount() {
    
    /**
     * If the URL contains an access token as a hash value, automatically
     * run this.search() to store the authentication token in Spotify.js
     * This will return a search result and calls to Spotify.checkAuthentication()
     * will return true so the results and playlist components will render
     */
    const hashValues = Spotify.processRedirectUriHash();
    
    if (hashValues.accessToken) {
      this.search(hashValues.searchTerm);
    }
  }
}

export default App;