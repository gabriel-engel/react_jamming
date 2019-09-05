import React from 'react';
import './PlaylistListItem.css';

class PlaylistListItem extends React.Component {
  constructor(props) {
    super(props);
    
    this.openPlaylist = this.openPlaylist.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
  }
  
  openPlaylist() {
    this.props.onOpen(this.props.playlist.id);
  }
  
  deletePlaylist() {
    this.props.onDelete(this.props.playlist.id);
  }
  
  render() {
    return (
      <div className="PlaylistItem">
        <h3
          onClick={this.openPlaylist}>
          {this.props.playlist.name}
        </h3>
        <button
          className="Track-action"
          onClick={this.deletePlaylist}>
          -
        </button>
      </div>
    )
  }
}

export default PlaylistListItem;