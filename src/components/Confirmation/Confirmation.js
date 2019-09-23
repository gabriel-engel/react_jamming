import React from 'react';
import './Confirmation.css';

class Confirmation extends React.Component {
  constructor(props) {
    super(props);
    
    this.handleYes = this.handleYes.bind(this);
    this.handleNo = this.handleNo.bind(this);
  }
  
  handleYes() {
    this.props.confirmation.func(...this.props.confirmation.params, "yes");
  }
  
  handleNo() {
    console.log(this.props.confirmation);
    this.props.confirmation.func(...this.props.confirmation.params, "no");
  }
  
  render() {
    console.log(this.props.confirmation);
      return (
        <div className="Confirmation-background">
          <div className="Confirmation-box">
            <p className="Confirmation-message">{this.props.confirmation.msg}</p>
            <div className="Confirmation-options">
              <button
                className="Confirmation-option-one"
                onClick={this.handleYes}>
                Yes
              </button>
              <button
                className="Confirmation-option-two"
                onClick={this.handleNo}>
                No
              </button>
            </div>
          </div>
        </div>
      );
  }
}

export default Confirmation;