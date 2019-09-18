
import React from 'react';
import './Track.css';

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
  }
  
  addTrack() {
    this.props.onAdd(this.props.index, this.props.isInPlaylist);
  }
  
  removeTrack() {
    this.props.onRemove(this.props.index);
  }
    
  renderSimpleTrackInfo() {
    if (this.props.trackPreview === false) {
      return (
        <a
          href={`https://open.spotify.com/track/${this.props.track.id}`}
          target="_blank" >
          <div className="Track-information">
            <div className="Track-information-img">
              <img 
                src={this.props.track.imageUrl}
                alt="track art"
              />
            </div>
            <div className="Track-information-text">
              <h3>{this.props.track.name}</h3>
              <p>{this.props.track.artist} | {this.props.track.album}</p>
            </div>
          </div>
        </a>
      )
    }
  }
  
  renderAdvancedTrackInfo() {
    if (this.props.trackPreview === true) {
     return (
       <div className="Track-preview">
         <iframe
            src={`https://open.spotify.com/embed/track/${this.props.track.id}`}
            allowtransparency="true"
            allow="encrypted-media">
         </iframe>
       </div>
      )     
    }
  }
  
  renderAction() {
    if (this.props.track.delete) {
      return <button className="Track-action" onClick={this.addTrack}>+</button>;
    } else if (!this.props.isInPlaylist) {
      return <button className="Track-action" onClick={this.addTrack}>+</button>;
    } else {
      return <button className="Track-action" onClick={this.removeTrack}>-</button>;
    }
  }
  
  render() {
    // add delete class to tracks flagged for deletion
    let className = 'Track';
    if (this.props.track.delete) {
      className += ' delete';
    }
    
    return (
        <div className={className}>
          {this.renderSimpleTrackInfo()}
          {this.renderAdvancedTrackInfo()}
          {this.renderAction()}
        </div>
    );
  }
}

export default Track;