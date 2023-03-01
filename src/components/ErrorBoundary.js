import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
	state = { hasError: false };

	componentDidCatch(error) {
		// report the error to your favorite Error Tracking tool (ex: Sentry, Bugsnag)
		console.error(error);
		if (window.newrelic) {
			window.newrelic.noticeError(error);
		}
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}
	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						color: 'red',
						border: '1px solid red',
						borderRadius: '0.25rem',
						margin: '0.5rem',
						padding: '0.5rem'
					}}>
					An error was thrown.
				</div>
			);
		}

		return <React.StrictMode>{this.props.children}</React.StrictMode>;
	}
}
