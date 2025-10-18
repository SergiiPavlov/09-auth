'use client';
import React from 'react';
import css from './SearchBox.module.css';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: (value: string) => void; // ← новое
}

export default function SearchBox({ value, onChange, onEnter }: SearchBoxProps) {
  return (
    <input
      className={css.input}
      type="text"
      placeholder="Search notes"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onEnter?.((e.target as HTMLInputElement).value);
        }
      }}
    />
  );
}
