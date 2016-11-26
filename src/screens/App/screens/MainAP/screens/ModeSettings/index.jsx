import React, { Component } from 'react';
import Tab from 'shared/components/Tab';

export default class ModeSettings extends Component {
  render() {
    return (
      <Tab
        menus={this.props.route.childRoutes}
        role="tab"
      >
        {this.props.children}
      </Tab>
    );
  }
}
