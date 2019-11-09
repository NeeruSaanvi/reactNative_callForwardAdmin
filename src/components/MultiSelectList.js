import React, {Component} from 'react';
import PropTypes from 'prop-types';

class MultiSelectList extends Component {
  static propTypes = {
    items:PropTypes.arrayOf(PropTypes.string),
    selectedItem:PropTypes.string,
    toggleSelection:PropTypes.func,
    rowHeight: PropTypes.number
  };

  static defaultProps = {
    rowHeight: 20
  };

  render() {
    const style={
      padding: 10, border: '1px solid #e4e7ea', borderRadius: 4, overflowY: 'scroll', height: 150
    };
    return (
      <div>
        {this.props.items.length !== 0 ?
          <div style={style}>
            {this.props.items.map((item) => {
              const isActive = this.props.selectedItem.findIndex(i => i === item) === -1;
              return(
                <div style={{width:'100%', height: this.props.rowHeight, backgroundColor: isActive ? '#fff' : '#00CED1'}} onClick={() => this.props.toggleSelection(item)}>{item}</div>
              )
            })}
          </div> : ""
        }

      </div>
    )
  }


}

export default MultiSelectList;
