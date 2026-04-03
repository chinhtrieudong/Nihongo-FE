import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="An unexpected error occurred. Please try refreshing the page."
          extra={[
            <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>,
            <Button key="refresh" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>,
            <Button key="reset" onClick={this.handleReset}>
              Try Again
            </Button>
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <h4>Error Details (Development Only):</h4>
              <pre style={{ fontSize: 12, overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
