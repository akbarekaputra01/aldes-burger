import React from 'react'

/**
 * SilentErrorBoundary - Menangkap error tanpa crash tampilan.
 * Jika terjadi error (contoh: Leaflet "Map container is being reused"),
 * komponen ini hanya memanggil onError callback (opsional) dan
 * merender null / fallback, bukan crash seluruh halaman.
 */
class SilentErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[SilentErrorBoundary] Caught error, suppressed from UI:', error?.message)
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo)
    }
  }

  // Saat props 'resetKey' berubah (misal: modal dibuka/tutup), reset state error
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.resetKey !== prevState.prevResetKey) {
      return { hasError: false, prevResetKey: nextProps.resetKey }
    }
    return null
  }

  render() {
    if (this.state.hasError) {
      // Tampilkan fallback jika ada, atau null (tidak ada tampilan error)
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

export default SilentErrorBoundary
