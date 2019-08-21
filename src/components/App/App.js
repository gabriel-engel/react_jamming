import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

let testResults = [];
let testTracks = [];

for (let i = 1; i < 4; i++) {
  
  const obj = {
    id: i,
    name: `name${i}`,
    artist: `artist${i}`,
    album: `album${i}`
  }
  
  testResults.push(obj);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      searchResults: testResults,
      playlistName: 'Test Playlist',
      playlistTracks: testTracks
    }
    
    this.search = this.search.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
  }
  
  search(term) {    
    Spotify.search(term)
    .then(searchResults => {
      this.setState({
        searchResults: searchResults
      });
    });
  }
  
  addTrack(track) {
    let tracks = this.state.playlistTracks;
    
    // if the track is in the playlist, exit method
    if (tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    } else {
      tracks.push(track);
      this.setState({
        playlistTracks: tracks
      });
    }
  }
  
  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter(removedTrack => removedTrack.id !== track.id);
    
    this.setState({
      playlistTracks: tracks
    });
  }
  
  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    });
  }
  
  savePlaylist() {
    // generate array of uri values from playlistTracks
    // pass trackURIs array and playlistName to method to save user's playlist to Spotify
    const trackUris = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackUris)
    .then( () => {
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: []
      });
    });
  }
    
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar
            onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack}
              isRemoval={false} />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              isRemoval={true}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;