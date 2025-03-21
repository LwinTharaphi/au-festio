// FormField.js
import React from 'react';
import { TextField, Typography, Switch, Radio, RadioGroup, FormControlLabel, Button } from '@mui/material';

function FormField({ title, type, placeholder, value, onChange, options, fileUpload }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography variant="subtitle1">{title}</Typography>

      {type === 'text' && (
        <TextField
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {type === 'number' && (
        <TextField
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))} // Ensure the value is a number
        />
      )}

      {type === 'switch' && (
        <FormControlLabel
          control={<Switch checked={value} onChange={(e) => onChange(e.target.checked)} />}
          label=""
        />
      )}

      {type === 'radio' && options && (
        <RadioGroup row value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      )}

      {type === 'file' && fileUpload && (
        <Button variant="contained" component="label" color="primary">
          {fileUpload}
          <input type="file" hidden onChange={(e) => onChange(e.target.files[0])} />
        </Button>
      )}

      {type === 'date' && (
        <TextField
          fullWidth
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)} // Pass the selected date
        />
      )}

      {type === 'password' && (
        <TextField
          fullWidth
          type="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {type === 'time' && (
        <TextField
          fullWidth
          type="time"
          value={value || ""} // Default to an empty string if value is undefined
          onChange={(e) => {
            if (e?.target?.value) {
              onChange(e.target.value); // Safely pass the value up
            }
          }}
        />
      )}
    </div>
  );
}

export default FormField;
