import type { InputHTMLAttributes, ReactNode } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  endIcon?: ReactNode
}

export function Input({
  label,
  error,
  helperText,
  endIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={`ui-input-group ${className}`}>
      {label && (
        <label className="ui-input-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div
        className={`ui-input-wrapper ${
          error ? 'ui-input-wrapper--error' : ''
        }`}
      >
        <input
          id={id}
          className="ui-input"
          {...props}
        />

        {endIcon && (
          <div className="ui-input-end-icon">
            {endIcon}
          </div>
        )}
      </div>

      {error && <span className="ui-input-error">{error}</span>}

      {!error && helperText && (
        <span className="ui-input-helper">{helperText}</span>
      )}
    </div>
  )
}