import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import PlaylistList from '../PlaylistList/PlaylistList';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';
import Confirmation from '../Confirmation/Confirmation';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      searchResults: [],
      playlistList: [],
      playlistTracks: [],
      backupPlaylistTracks: [],
      playlistTracksToRemove: [],
      currentPlaylistList: false,
      playlistView: false,
      playlistName: '',
      playlistId: '',
      trackPreview: false,
      showDuplicateTracks: true,
      confirmation: {},
      touchInput: false
    }    
    
    this.search = this.search.bind(this);
    this.getUserPlaylists = this.getUserPlaylists.bind(this);
    this.getPlaylistTracks = this.getPlaylistTracks.bind(this);
    this.checkForChangesInPlaylist = this.checkForChangesInPlaylist.bind(this);
    this.setPlaylistDetails = this.setPlaylistDetails.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.swapTracks = this.swapTracks.bind(this);
    this.trackIsInSearchResults = this.trackIsInSearchResults.bind(this);
    this.trackIsInPlaylist = this.trackIsInPlaylist.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.checkForNewPlaylistName = this.checkForNewPlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
    this.togglePlaylistView = this.togglePlaylistView.bind(this);
    this.hideShowDuplicateTracks = this.hideShowDuplicateTracks.bind(this);
    this.toggleTrackPreview = this.toggleTrackPreview.bind(this);
    this.toggleDuplicateTrackVisibility = this.toggleDuplicateTrackVisibility.bind(this);
    this.handleTouchInput = this.handleTouchInput.bind(this);
    this.beforeLeavingApp = this.beforeLeavingApp.bind(this);
  }
    
  search(term) {
    Spotify.search(term)
    .then(searchResults => {
      this.setState({
        searchResults: searchResults
      });
    })
    .then(() => this.hideShowDuplicateTracks());
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
      
      // create a backup of unique tracks
      const backupPlaylistTracks = [];
      
      for (let track of playlistTracks) {
        backupPlaylistTracks.push(Object.assign({}, track));
      }
      
      this.setState({
        playlistTracks: playlistTracks,
        backupPlaylistTracks: backupPlaylistTracks
      });
    })
    .then(() => this.hideShowDuplicateTracks());
    
    // set playlist details
    this.setPlaylistDetails(playlistId);
  }
  
  checkForChangesInPlaylist() {
    const playlist = this.state.playlistTracks;
    const backup = this.state.backupPlaylistTracks;
    
    if (playlist.length !== backup.length) return true;
    
    for (let track of playlist) {
      if (track.delete === true) return true;
    }
    
    for (let i = 0; i < playlist.length; i++) {
      if (playlist[i].id !== backup[i].id) return true;
    }
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
  
  addTrack(key, fromPlaylist) {
    
    const searchResults = this.state.searchResults;
    const playlistTracks = this.state.playlistTracks;
        
    // if readding a deleted track from the playlist, change delete property
    if (fromPlaylist) {
      playlistTracks[key].delete = false;
      
      // use set state to force an update to the track
      this.setState({});
    } else {
          
      const track = Object.assign({}, searchResults[key]);
      
      playlistTracks.push(track);
      
      // if show duplicates is off, hide the track in the search results
      if (!this.state.showDuplicateTracks) {
        searchResults[key].visible = false;
      }
      
      this.setState({
        playlistTracks: playlistTracks
      });
    }
  }
  
  removeTrack(key) {
    
    const tracks = this.state.playlistTracks;
    const searchResults = this.state.searchResults;
        
    // if track is not in search results cross it out rather than remove it
    if (!this.trackIsInSearchResults(tracks[key].id)) {
      tracks[key].delete = true;

      // use set state to force an update to the track
      this.setState({});
    } else {
      
      // if show duplicates is off, reveal the track in the search results again
      if (!this.state.showDuplicateTracks) {
        for (let result of searchResults) {
          if (result.id === tracks[key].id) {
            result.visible = true;
            break;
          }
        }
      }
      
      // filter out the removed track from the playlist track array
      const reducedTracks = tracks.filter((track, index) => index !== key);

      this.setState({
        playlistTracks: reducedTracks
      });
    }
  }
  
  swapTracks(indexA, indexB) {
    // rearrange visible tracks
    let trackList = this.state.playlistTracks.filter(track => track.visible);
    console.log(indexA);
    console.log(indexB);
    // make sure move is valid
    if (indexA === indexB) return;
    if (indexA < 0 || indexB < 0) return;
    if (indexA > trackList.length || indexB > trackList.length) return;
    if (indexA === trackList.length - 1 && indexB === 'end') return;
    
    // handle moving second to last track down using the down button
    if (indexB === trackList.length) indexB = 'end';
    
    const newTrackList = [];
    const sourceTrack = trackList[indexA];
    
    // skip pushing source track until we are at indexB
    for (let i = 0; i < trackList.length; i++) {
      if (i !== indexA) {
        // if at insertion point, push the source track
        if (i === indexB) newTrackList.push(sourceTrack);
        
        newTrackList.push(trackList[i]);
        
        // if at end and insertion point is at the end, push source track
        if (i === trackList.length - 1 && indexB === 'end') {
          newTrackList.push(sourceTrack);
        }
      }
    }
    
    let finalPlaylist = [];
    // if there are invisible tracks, add them back into array
    if (newTrackList.length !== this.state.playlistTracks.length) {
      let i = 0;
      for (let track of this.state.playlistTracks) {
        if (track.visible) {
          console.log(newTrackList);
          console.log(newTrackList[i]);
          finalPlaylist.push(newTrackList[i]);
          i++;
        } else {
          finalPlaylist.push(track);
        }
      }
    } else {
      finalPlaylist = newTrackList;
    }
    
    this.setState({
      playlistTracks: finalPlaylist
    });
    
  }
  
  trackIsInSearchResults(trackId) {
    for (let track of this.state.searchResults) {
      if (track.id === trackId) return true;
    }
    return false;
  }
  
  trackIsInPlaylist(trackId) {
    for (let track of this.state.playlistTracks) {
      if (track.id === trackId) return true;
    }
    return false;
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
  
  savePlaylist(confirm) {
    // all tracks minus those flagged for deletion
    let tracks = this.state.playlistTracks.filter(track => !track.delete);
    const totalNumberOfTracks = tracks.slice().length;

    // if tracks are hidden
    if (!this.state.showDuplicateTracks) {
      
      const visibleTracks = tracks.filter(track => track.visible);

      // if there are invisible tracks, get save confirmation
      if (visibleTracks.length !== totalNumberOfTracks && !confirm) {
        const message = "Hidden duplicate tracks will not be saved";
        this.getConfirmation(message, this.savePlaylist);
        return;
      }
      
      // handle confirmation response
      if (confirm === "no") {
        this.setState({
          confirmation: {}
        });
        return;
      }
      
      if (confirm === "yes") {
        this.setState({
          confirmation: {}
        });
      }
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
  
  deletePlaylist(playlistId, confirm) {
    if (!confirm) {
      const message = "Are you sure you want to delete the playlist?";
      this.getConfirmation(message, this.deletePlaylist, playlistId);
      return;
    }
    
    console.log(`confirm: ${confirm}`);
    
    if (confirm === "no") {
      console.log('playlist not deleted');
      this.setState({
        confirmation: {}
      });
      return;
    }
    
    if (confirm === "yes") {
      console.log('playlist deleted');
      this.setState({
        confirmation: {}
      });
    }
    
    Spotify.deletePlaylist(playlistId)
    .then(() => this.getUserPlaylists());
  }
  
  renderSearchResults() {
    if (Spotify.checkAuthentication()) {      
      return (
        <SearchResults
        searchResults={this.state.searchResults}
        onAdd={this.addTrack}
        isInPlaylist={false}
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
          onAdd={this.addTrack}
          onSwap={this.swapTracks}
          touchInput={this.state.touchInput}
          isInPlaylist={true}
          onNameChange={this.updatePlaylistName}
          onSave={this.savePlaylist}
          trackPreview={this.state.trackPreview} />
      )
    }
  }
  
  renderConfirmation() {
    if (this.state.confirmation.msg) {
      console.log(this.state.confirmation);
      return (
        <Confirmation 
          confirmation={this.state.confirmation} />
      );
    }
  }
  
  togglePlaylistView(playlistId, confirm) {
    console.log('toggle');
    console.log(playlistId);
    /**
     * If there is a playlistId and it isn't the result of a user confirmation
     * callback function, the user is accessing a playlist from the playlistList
     * component
     *
     * Otherwise, the user is exiting a playlist and a confirmation is required
     */
    if (playlistId && !confirm) {
      this.getPlaylistTracks(playlistId);
      this.setState({
        playlistView: !this.state.playlistView
      });
    } else {
      
      // first, ask user for confirmation
      if (this.checkForChangesInPlaylist() && !confirm) {
        const message = "Unsaved changes will not be saved, continue?";
        this.getConfirmation(message, this.togglePlaylistView, this.state.playlistId);
        return;
      }
      
      // next, reset confirmation state and proceed according to confirm reply
      
      if (confirm === "no") {
        this.setState({
          confirmation: {}
        });
        return;
      }

      if(confirm === "yes") {
        this.setState({
          confirmation: {}
        });
      }
      
      this.setState({
        playlistTracks: [],
        backupPlaylistTracks: [],
        playlistName: '',
        playlistView: !this.state.playlistView
      });
    }
  }
  
  toggleTrackPreview() {
    this.setState({
      trackPreview: !this.state.trackPreview
    });
  }
  
  hideShowDuplicateTracks(toggle) {
    console.log('hide-------show');
    const visible = !toggle ? this.state.showDuplicateTracks : !this.state.showDuplicateTracks;
    const searchResults = this.state.searchResults;
    const playlistTracks = this.state.playlistTracks;
    console.log(`show duplicate tracks in hideShow(): ${visible}`);
    console.log('-------------------');
    // if duplicate tracks are supposed to be invisible
    if (!visible) {

      // hide all but one of any track in playlist
      for (let i = 0; i < playlistTracks.length; i++) {
        if (playlistTracks[i].visible === false) continue;
        for (let j = i + 1; j < playlistTracks.length; j++) {
          if (playlistTracks[i].id === playlistTracks[j].id) {
            playlistTracks[j].visible = false;
          }
        }
      }
      
      // if track is in search results, hide it
      for (let result of searchResults) {
        if (this.trackIsInPlaylist(result.id)) result.visible = false;
      }
      
    } else {
      // if duplicate tracks are hidden, show them
      for (let result of searchResults) {
        result.visible = true;
      }
      
      for (let track of playlistTracks) {
        track.visible = true;
      }
    }
    
    this.setState({
      searchResults: searchResults,
      playlistTracks: playlistTracks,
      showDuplicateTracks: visible
    });
  }
  
  toggleDuplicateTrackVisibility() {
    this.hideShowDuplicateTracks(true);
  }
  
  getConfirmation(msg, func, ...params) {
    console.log(msg);
    console.log(func);
    console.log(...params);
    this.setState({
      confirmation: {
        msg,
        func,
        params
      }
    });
  }
  
  handleTouchInput(event) {
    this.setState({touchInput: true});
  }
  
  beforeLeavingApp(confirm) {
    if (this.checkForChangesInPlaylist()) {
      return "Unsaved changes will be lost, leave?";
    } else {
      return;
    }
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
            Show Duplicate Tracks: {this.state.showDuplicateTracks ? "Yes" : "No"}
            </button>
          </ div>
          <div className="App-lists">
            {this.renderSearchResults()}
            {this.renderPlaylistList()}
            {this.renderPlaylist()}
          </div>
        </div>
        {this.renderConfirmation()}
      </div>
    );
  }
  
  componentDidMount() {
    document.addEventListener('touchstart', this.handleTouchInput);
    
    window.onbeforeunload = this.beforeLeavingApp;
    
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