
import React from 'react';
import './Track.css';

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.handleMoveUp = this.handleMoveUp.bind(this);
    this.handleMoveDown = this.handleMoveDown.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }
  
  addTrack() {
    this.props.onAdd(this.props.index, this.props.isInPlaylist);
  }
  
  removeTrack() {
    this.props.onRemove(this.props.index);
  }
  
  handleMoveUp() {
    const trackIndex = this.props.index;
    
    this.props.onSwap(trackIndex, trackIndex - 1);
  }
  
  handleMoveDown() {
    const trackIndex = this.props.index;
    
    // goes above second index so must add 2
    this.props.onSwap(trackIndex, trackIndex + 2);
  }
  
  isTrack(element) {
    return element.classList.contains('Track');
  }
  
  nearestTrack(element) {
    while (true) {
      if (this.isTrack(element)) return element;
      
      element = element.parentElement;
      
      if (element === null) return false;
    }
  }
  
  clearTrackCSS(fullClear) {
    const trackList = document.querySelectorAll('.Playlist .Track')
    const clearClasses = fullClear ? 
          ['dragStart', 'moveOver', 'moveUnder'] :
          ['moveOver', 'moveUnder'];
    
    for (let track of trackList) {
      track.classList.remove(...clearClasses);
    }
  }
    
  handleDragStart(event) {
    // move up the DOM to find source track or exit if can't find
    const sourceTrack = this.nearestTrack(event.target);
    
    if (!sourceTrack) return;
    
    // assign CSS to source track and store its index
    sourceTrack.classList.add('dragStart');

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text', this.props.index);
  }
  
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  
  handleDragEnter(event) {
    const trackList = document.querySelectorAll('.Playlist .Track');
    const sourceTrack = document.querySelector('.dragStart');
    const enteredElement = event.target;
    const enteredTrack = this.nearestTrack(enteredElement);
    const belowTracklist = document.querySelector('.Below-Tracklist');
    
    if (enteredTrack) {
      if (enteredTrack === sourceTrack) {
        this.clearTrackCSS();
      } else if (enteredTrack !== sourceTrack.nextElementSibling) {
        this.clearTrackCSS();
        enteredTrack.classList.add('moveOver');
      } else {
        this.clearTrackCSS();
      }
    }
    
    if (enteredElement === belowTracklist) {
      this.clearTrackCSS();
      trackList[trackList.length - 1].classList.add('moveUnder');
    }
  }
  
  handleDrop(event) {
    if (event.stopPropagation) event.stopPropagation();
    
    const indexA = +event.dataTransfer.getData('text');
    const indexB = typeof this.props.index === 'number' ? this.props.index : 'end';
    
    this.props.onSwap(indexA, indexB);
  }
  
  handleDragEnd(event) {
    this.clearTrackCSS(true);
  }
  
  renderUpDownButtons() {
    if (this.props.isInPlaylist && this.props.touchInput) {
      return (
        <div className="Movement-Arrows">
          <button onClick={this.handleMoveUp} >
            <div className="Up"></div>
          </button>
          <button onClick={this.handleMoveDown} >
            <div className="Down"></div>
          </button>
        </div>
      );
    }
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
    if (!this.props.isBottomTrack) {
      let className = 'Track';
      if (this.props.track.delete) {
        className += ' delete';
      }
    
      return (
          <div className={className} draggable="true">
            {this.renderUpDownButtons()}
            {this.renderSimpleTrackInfo()}
            {this.renderAdvancedTrackInfo()}
            {this.renderAction()}
          </div>
      );
    } else {
      return <div className="Below-Tracklist"></div>;
    }
  }
  
  componentDidMount() {
    /**
     * Add event listeners to tracks and the below track element in <Playlist />
     * Add event listeners to event.preventDefault() for tracks in <SearchResults />
     */
    
    if (this.props.isInPlaylist) {
      let playlistElement = null;

      if (!this.props.isBottomTrack) {
        console.log('track');
        console.log(document.querySelectorAll('.Playlist .Track'));
        console.log(this.props.index);
        playlistElement = document.querySelectorAll('.Playlist .Track')[this.props.index];
      } else {
        console.log('bottom');
        playlistElement = document.querySelector('.Playlist .Below-Tracklist');
      }
      console.log(playlistElement);
      playlistElement.addEventListener('dragstart', this.handleDragStart);
      playlistElement.addEventListener('dragover', this.handleDragOver);
      playlistElement.addEventListener('dragenter', this.handleDragEnter);
      playlistElement.addEventListener('drop', this.handleDrop);
      playlistElement.addEventListener('dragend', this.handleDragEnd);
    } else {
      const searchResultElement = document.querySelectorAll('.SearchResults .Track')[this.props.index];
      
      searchResultElement.addEventListener('mousedown', (event) => event.preventDefault());
    }    
  }
}

export default Track;