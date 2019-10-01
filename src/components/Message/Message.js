import React from 'react';
import './Message.css';

class Message extends React.Component {
  constructor(props) {
    super(props);
    
    this.hideMessage = this.hideMessage.bind(this);
  }
  
  hideMessage(messageDOM) {
    messageDOM.classList.add('Message-hidden');
  }
  
  shouldComponentUpdate(nextProps) {
    if (this.props.messageId !== nextProps.messageId) {
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
  
  render() {
      return (
        <div className="Message Message-hidden">
          {this.props.message}
        </div>
        );
  }
  
  componentWillUnmount() {
    // if component unmounts before setTimeout triggers must be cleared
    clearTimeout(this.hideMessageDelay);
  }
}

export default Message;