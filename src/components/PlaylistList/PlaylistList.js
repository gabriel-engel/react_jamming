import React from 'react';
import './PlaylistList.css';
import PlaylistListItem from '../PlaylistListItem/PlaylistListItem';

class PlaylistList extends React.Component {
  render() {
    return (
      <div className="PlaylistList">
        <PlaylistListItem 
          key={"new playlist"}
          playlist={{name: '+ Create New Playlist'}}
          onOpen={this.props.onOpen}
          />
        {
          this.props.playlistList.map(playlist => {
            return <PlaylistListItem
                     key={playlist.id} 
                     playlist={playlist}
                     onOpen={this.props.onOpen}
                     onDelete={this.props.onDelete} />
          })
        }
      </div>
    )
  }
}

export default PlaylistList;