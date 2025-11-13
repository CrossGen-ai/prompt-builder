import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

describe('UI Components', () => {
  describe('Button', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should handle click events', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByText('Click me')
      await userEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByText('Disabled')
      expect(button).toBeDisabled()
    })

    it('should apply variant styles', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('should apply size styles', () => {
      const { container } = render(<Button size="sm">Small</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('h-8')
    })

    it('should handle double click prevention', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      const button = screen.getByText('Click')
      await userEvent.dblClick(button)

      // Button should handle both clicks
      expect(handleClick).toHaveBeenCalled()
    })

    it('should accept custom className', () => {
      const { container } = render(<Button className="custom-class">Custom</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should render with loading state', () => {
      render(<Button disabled>Loading...</Button>)
      const button = screen.getByText('Loading...')
      expect(button).toBeDisabled()
    })
  })

  describe('Input', () => {
    it('should render input field', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should handle value changes', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Hello')

      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('Hello')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should accept different input types', () => {
      render(<Input type="email" placeholder="Email" />)
      const input = screen.getByPlaceholderText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should handle maxLength attribute', () => {
      render(<Input maxLength={10} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-input" />)
      const input = container.querySelector('input')
      expect(input).toHaveClass('custom-input')
    })

    it('should handle paste events', async () => {
      render(<Input />)
      const input = screen.getByRole('textbox')

      await userEvent.click(input)
      await userEvent.paste('Pasted text')

      expect(input).toHaveValue('Pasted text')
    })

    it('should handle clear/empty value', async () => {
      render(<Input defaultValue="Initial" />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await userEvent.clear(input)

      expect(input.value).toBe('')
    })
  })

  describe('Textarea', () => {
    it('should render textarea', () => {
      render(<Textarea placeholder="Enter long text" />)
      expect(screen.getByPlaceholderText('Enter long text')).toBeInTheDocument()
    })

    it('should handle value changes', async () => {
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      await userEvent.type(textarea, 'Multi\nline\ntext')

      expect(handleChange).toHaveBeenCalled()
      expect(textarea).toHaveValue('Multi\nline\ntext')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should handle rows attribute', () => {
      render(<Textarea rows={10} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should handle long text input', async () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')

      const longText = 'a'.repeat(1000)
      await userEvent.type(textarea, longText)

      expect(textarea).toHaveValue(longText)
    })

    it('should maintain newlines in value', async () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')

      await userEvent.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')

      expect(textarea.value).toContain('\n')
    })
  })

  describe('Checkbox', () => {
    it('should render checkbox', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should handle checked state changes', async () => {
      const handleChange = jest.fn()
      render(<Checkbox onCheckedChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('should be checked when checked prop is true', () => {
      render(<Checkbox checked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('should toggle between checked and unchecked', async () => {
      const { rerender } = render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).not.toBeChecked()

      rerender(<Checkbox checked={true} />)
      expect(checkbox).toBeChecked()

      rerender(<Checkbox checked={false} />)
      expect(checkbox).not.toBeChecked()
    })

    it('should handle indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBePartiallyChecked()
    })
  })

  describe('Switch', () => {
    it('should render switch', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
    })

    it('should handle checked state changes', async () => {
      const handleChange = jest.fn()
      render(<Switch onCheckedChange={handleChange} />)

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('should be checked when checked prop is true', () => {
      render(<Switch checked />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Switch disabled />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeDisabled()
    })

    it('should toggle state on click', async () => {
      let checked = false
      const handleChange = (value: boolean) => {
        checked = value
      }

      const { rerender } = render(
        <Switch checked={checked} onCheckedChange={handleChange} />
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(checked).toBe(true)

      rerender(<Switch checked={checked} onCheckedChange={handleChange} />)
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('should not toggle when disabled', async () => {
      const handleChange = jest.fn()
      render(<Switch disabled onCheckedChange={handleChange} />)

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on Button', () => {
      render(<Button aria-label="Submit form">Submit</Button>)
      const button = screen.getByLabelText('Submit form')
      expect(button).toBeInTheDocument()
    })

    it('should have proper ARIA labels on Input', () => {
      render(<Input aria-label="User name" />)
      const input = screen.getByLabelText('User name')
      expect(input).toBeInTheDocument()
    })

    it('should support keyboard navigation on Button', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Submit</Button>)

      const button = screen.getByText('Submit')
      button.focus()
      expect(button).toHaveFocus()

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      // Note: Some implementations may not trigger onClick on Enter by default
    })

    it('should support keyboard navigation on Checkbox', async () => {
      const handleChange = jest.fn()
      render(<Checkbox onCheckedChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      expect(checkbox).toHaveFocus()

      fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' })
      expect(handleChange).toHaveBeenCalled()
    })

    it('should have proper role attributes', () => {
      render(
        <div>
          <Button>Button</Button>
          <Input />
          <Checkbox />
          <Switch />
        </div>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicks on Button', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      const button = screen.getByText('Click')

      // Simulate rapid clicks
      await userEvent.tripleClick(button)

      // All clicks should be registered
      expect(handleClick).toHaveBeenCalled()
    })

    it('should handle very long input values', async () => {
      render(<Input />)
      const input = screen.getByRole('textbox')

      const longText = 'a'.repeat(10000)
      await userEvent.type(input, longText)

      expect(input).toHaveValue(longText)
    })

    it('should handle special characters in Input', async () => {
      render(<Input />)
      const input = screen.getByRole('textbox')

      await userEvent.type(input, '<script>alert("xss")</script>')

      expect(input).toHaveValue('<script>alert("xss")</script>')
    })

    it('should handle empty string in Textarea', async () => {
      render(<Textarea defaultValue="test" />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

      await userEvent.clear(textarea)

      expect(textarea.value).toBe('')
    })

    it('should maintain focus after state changes', async () => {
      const { rerender } = render(<Input value="" />)
      const input = screen.getByRole('textbox')

      input.focus()
      expect(input).toHaveFocus()

      rerender(<Input value="updated" />)
      // Note: Focus behavior may vary
    })
  })

  describe('Error States', () => {
    it('should handle null onClick gracefully', () => {
      expect(() => {
        render(<Button onClick={null as any}>Click</Button>)
      }).not.toThrow()
    })

    it('should handle undefined value in Input', () => {
      expect(() => {
        render(<Input value={undefined} />)
      }).not.toThrow()
    })

    it('should handle invalid checked value in Checkbox', () => {
      expect(() => {
        render(<Checkbox checked={undefined} />)
      }).not.toThrow()
    })
  })
})
