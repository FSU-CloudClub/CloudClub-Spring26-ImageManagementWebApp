import 'bootstrap/dist/css/bootstrap.min.css';

import React, { Component } from 'react'
import AWSNavbar from './components/navbar'
import HoverSidebar from './components/HoverSidebar'

export default class App extends Component {
  render() {
    return (
      <div>
        <AWSNavbar></AWSNavbar>
        <HoverSidebar></HoverSidebar>
      </div>
    ///   <div>
    //     <home1></home1>
    //   </div> 
    
    )
  }
}
