import React from 'react';
import './SearchBar.css';
import Spotify from '../../util/Spotify';

class SearchBar extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      term: ''
    }
    
    this.search = this.search.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
  }
  
  search() {
    this.props.onSearch(this.state.term);
  }
  
  handleTermChange(event) {
    this.setState({
      term: event.target.value
    });
  }
    
  render() {
    return (
      <div className="SearchBar">
        <input
          className="SearchBar-input"
          placeholder="Enter A Song, Album, or Artist"
          onChange={this.handleTermChange} />
        <button 
          className="SearchButton"
          onClick={this.search} >
          SEARCH
        </button>
      </div>
    );
  }
  
  componentDidMount() {
    const input = document.querySelector('.SearchBar-input');
    const hashTerm = Spotify.processRedirectUriHash().searchTerm;

    if (hashTerm !== undefined && hashTerm !== 'undefined') {
      input.value = hashTerm;
      this.setState({
        term: hashTerm
      });
    }
  }
}

export default SearchBar;