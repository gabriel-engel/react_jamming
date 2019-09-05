import React from 'react';
import './Playlist.css';
import TrackList from '../TrackList/TrackList';

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }
  
  handleBackButton() {
    this.props.onBack();
  }
  
  handleNameChange(event) {
    this.props.onNameChange(event.target.value);
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
          isRemoval={this.props.isRemoval} />
        <button
          className="Playlist-save"
          onClick={this.props.onSave} >
          SAVE TO SPOTIFY
        </button>
      </div>
    );
  }
}

export default Playlist;