import { render, screen } from '@testing-library/react'
import App from '../src/App'

test('renders HomeOps dashboard title', () => {
  render(<App />)
  expect(screen.getByText('HomeOps Dashboard')).toBeInTheDocument()
})

