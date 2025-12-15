import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import App from '../src/App'

test('renders HomeOps title', () => {
  render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  )
  expect(screen.getByText('HomeOps')).toBeInTheDocument()
})

