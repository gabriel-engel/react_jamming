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
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  
  search() {
    this.props.onSearch(this.state.term);
  }
  
  handleTermChange(event) {
    this.setState({
      term: event.target.value
    });
  }
  
  handleKeyPress(event) {
    if (event.key === 'Enter') this.search();
  }
    
  render() {
    return (
      <div className="SearchBar">
        <input
          className="SearchBar-input"
          placeholder="Enter A Song, Album, or Artist"
          onChange={this.handleTermChange}
          onKeyDown={this.handleKeyPress} />
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

    // when first arrive at callback URL, this properly updates input box
    if (hashTerm && (hashTerm !== undefined && hashTerm !== 'undefined')) {
      console.log('went');
      input.value = hashTerm;
      this.setState({
        term: hashTerm
      });
    }
  }
}

export default SearchBar;