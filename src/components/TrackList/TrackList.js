import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
  render() {  
    return (
      <div className="TrackList">
        {
          this.props.tracks.map((track, index) => {
            
            if (!track.visible) return;
            
            return <Track
                     key={index}
                     index={index}
                     track={track}
                     onAdd={this.props.onAdd}
                     onRemove={this.props.onRemove}
                     isRemoval={this.props.isRemoval}
                     trackPreview={this.props.trackPreview} />
          })
        }
      </div>
    )
  }
}

export default TrackList;