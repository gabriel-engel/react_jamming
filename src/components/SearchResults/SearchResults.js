import React from 'react';
import './SearchResults.css';
import TrackList from '../TrackList/TrackList';

class SearchResults extends React.Component {
  render() {
    return (
      <div className="SearchResults">
        <h2>Results</h2>
        <hr />
        <TrackList 
          tracks={this.props.searchResults}
          onAdd={this.props.onAdd}
          isInPlaylist={this.props.isInPlaylist}
          trackPreview={this.props.trackPreview} />
      </div>
    );
  }
}

export default SearchResults;