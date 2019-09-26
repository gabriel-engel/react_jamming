import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
    
  renderBelowTracklist() {
    if (this.props.isInPlaylist) {
      return <Track
               key="Below-Tracklist"
               onSwap={this.props.onSwap}
               isInPlaylist={this.props.isInPlaylist}
               isBottomTrack={true}
               />;
    }
  }
  
  render() {  
    
    let index = -1;
    
    return (
      <div className="TrackList">
        {
          this.props.tracks.map((track) => {

            if (!track.visible) return;
            index++;

            return <Track
                     key={index}
                     index={index}
                     track={track}
                     onAdd={this.props.onAdd}
                     onRemove={this.props.onRemove}
                     onSwap={this.props.onSwap}
                     touchInput={this.props.touchInput}
                     isInPlaylist={this.props.isInPlaylist}
                     trackPreview={this.props.trackPreview}
                     isBottomTrack={false}/>
          })
        }
        {this.renderBelowTracklist()}
      </div>
    );
  }
}

export default TrackList;