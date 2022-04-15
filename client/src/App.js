import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import MintPage from './pages/mint'
import IndexPage from './pages'

class App extends Component {
	render() {
		return (
			<Router>
				<Switch>
					<Route exact path="/shop" component={MintPage} />
					<Route exact path="/" component={IndexPage} />
					<Route exact path="*" component={IndexPage} />
				</Switch>
				<ToastContainer />
			</Router>
		)
	}
}

export default App
