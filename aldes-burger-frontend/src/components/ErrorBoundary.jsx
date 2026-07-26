import React from "react";
import { AlertCircle } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", backgroundColor: "#fef3c7", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", border: "4px solid black", boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)", maxWidth: "800px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <AlertCircle color="red" size={40} />
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "900", textTransform: "uppercase" }}>Something went wrong.</h1>
            </div>
            <p style={{ fontWeight: "bold" }}>Please screenshot this error and show it to the developer:</p>
            <pre style={{ backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", overflowX: "auto", border: "2px solid red", fontSize: "0.875rem", fontWeight: "bold" }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", color: "white", fontWeight: "900", textTransform: "uppercase", border: "4px solid black", borderRadius: "0.5rem", cursor: "pointer", boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
