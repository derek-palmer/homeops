import { render, screen } from '@testing-library/react'
import App from '../src/App'

test('renders HomeOps title', () => {
  render(<App />)
  expect(screen.getByText('HomeOps')).toBeInTheDocument()
})

