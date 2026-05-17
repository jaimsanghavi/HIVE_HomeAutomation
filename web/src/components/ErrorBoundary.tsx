import { Component, type ReactNode } from "react";
import Icon from "./Icon";
import Button from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-md-surface p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-md-error-container mx-auto flex items-center justify-center">
              <Icon name="Power" size={32} className="text-md-on-error-container" />
            </div>
            <h2 className="text-xl font-medium text-md-on-surface">Something went wrong</h2>
            <p className="text-sm text-md-on-surface-variant">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button variant="filled" onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
