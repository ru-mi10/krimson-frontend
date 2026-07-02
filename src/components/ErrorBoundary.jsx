// src/components/ErrorBoundary.jsx
import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[Krimson Error Boundary]', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: '#09090B' }}>
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center"
              style={{ backgroundColor: '#111113', borderColor: '#27272A' }}>
              <AlertTriangle size={20} style={{ color: '#DC2626' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>
                Something went wrong
              </p>
              <p className="text-xs" style={{ color: '#52525B' }}>
                An unexpected error occurred. Let's get you back home.
              </p>
            </div>
            <button onClick={this.handleReload}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
              style={{ backgroundColor: '#DC2626', color: '#FAFAFA' }}>
              Go to Homepage
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary