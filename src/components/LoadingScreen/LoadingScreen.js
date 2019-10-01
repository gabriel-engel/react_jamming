import React from 'react';
import './LoadingScreen.css';

class LoadingScreen extends React.Component {
  preventKeyboardInput(event) {
    event.preventDefault();  
  }
  
  render() {
    return (
      <div className="LoadingScreen">
        <div className="animation">
          <div className="circle"></div>
          <div className="dot one"></div>
          <div className="dot two"></div>
          <div className="dot three"></div>
          <div className="dot four"></div>
          <div className="dot five"></div>
          <div className="dot six"></div>
          <div className="dot seven"></div>
          <div className="dot eight"></div>
        </div>
      </div>
      );
  }
  
  componentDidMount() {
    document.addEventListener('keydown', this.preventKeyboardInput);
  }
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.preventKeyboardInput);
  }
}

export default LoadingScreen;