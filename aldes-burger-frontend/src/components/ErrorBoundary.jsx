import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retries: 0, prevLocationKey: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("[ErrorBoundary] Error caught silently:", error?.message);

    // Langsung reset dirinya sendiri tanpa menampilkan UI apapun
    // setTimeout(0) untuk memutus siklus render sebelum mencoba ulang
    setTimeout(() => {
      this.setState((prev) => ({
        hasError: false,
        retries: prev.retries + 1,
      }));
    }, 0);
  }

  // Auto-reset saat user pindah halaman
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.locationKey !== prevState.prevLocationKey) {
      return { hasError: false, retries: 0, prevLocationKey: nextProps.locationKey };
    }
    return null;
  }

  render() {
    // Tidak pernah tampilkan layar error — langsung render children
    // (hasError state hanya berlangsung 1 frame sebelum componentDidCatch reset-kan)
    if (this.state.hasError) {
      return null; // Flash sesaat, tidak terlihat user
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
