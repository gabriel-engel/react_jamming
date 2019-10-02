import React from 'react';
import './Message.css';

class Message extends React.Component {
  constructor(props) {
    super(props);
    
    this.handleUndo = this.handleUndo.bind(this);
    this.hideMessage = this.hideMessage.bind(this);
  }
  
  handleUndo() {
    this.props.undo();
  }
  
  hideMessage(messageDOM) {
    messageDOM.classList.add('Message-hidden');
  }
  
  
  shouldComponentUpdate(nextProps) {
    // if there is message with a new id
    if (this.props.messageId !== nextProps.messageId) {
      return true;
    }
    
    // if an undo is newly available
    if (!this.props.undoAvailable && nextProps.undoAvailable) {
      return true;
    }

    return false;
  }
  
  
  componentDidUpdate(prevProps) {
    if (this.props.message) {
      const messageDOM = document.querySelector('.Message');
      
      // if message is hidden, unhide it
      if (messageDOM.classList.contains('Message-hidden')) {
        messageDOM.classList.remove('Message-hidden');
      }
      
      // if message has a delayed hide function, cancel it to reset the timer
      if (this.hideMessageDelay) {
        clearTimeout(this.hideMessageDelay);
      }
      
      // hide the message after a delay
      this.hideMessageDelay = setTimeout(() => this.hideMessage(messageDOM), 4000);
    }
  }
  
  renderUndo() {
    if (this.props.undoAvailable) {
      return (
        <span
          className="Undo"
          onClick={this.handleUndo} >
          (undo)
        </span>
      );
    }
  }
  
  render() {
      return (
        <div className="Message Message-hidden">
          {this.props.message}
          {this.renderUndo()}
        </div>
        );
  }
  
  componentWillUnmount() {
    // if component unmounts before setTimeout triggers must be cleared
    clearTimeout(this.hideMessageDelay);
  }
}

export default Message;