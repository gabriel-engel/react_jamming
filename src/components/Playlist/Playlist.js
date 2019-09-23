import React from 'react';
import './Playlist.css';
import TrackList from '../TrackList/TrackList';

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }
  
  handleBackButton() {
    this.props.onBack();
  }
  
  handleNameChange(event) {
    this.props.onNameChange(event.target.value);
  }
  
  handleSave() {
    this.props.onSave();
  }
  
  render() {
    return (
      <div className="Playlist">
        <button
          className="Playlist-back"
          onClick={this.handleBackButton}>
          BACK
        </button>
        <input
          defaultValue={this.props.playlistName || 'Name Your Playlist'}
          onChange={this.handleNameChange} />
        <TrackList
          tracks={this.props.playlistTracks}
          onRemove={this.props.onRemove}
          onAdd={this.props.onAdd}
          isInPlaylist={this.props.isInPlaylist}
          trackPreview={this.props.trackPreview} />
        <button
          className="Playlist-save"
          onClick={this.handleSave} >
          SAVE TO SPOTIFY
        </button>
      </div>
    );
  }
}

export default Playlist;