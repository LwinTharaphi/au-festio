"use client";
import React, { useState, useRef } from 'react';
import { Box, Button, Paper, Typography, TextField, IconButton } from '@mui/material';
import FormField from '../components/FormField';
import CloseIcon from '@mui/icons-material/Close';

function EventForm() {
  const [isArEnabled, setIsArEnabled] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [poster, setPoster] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [posterName, setPosterName] = useState('');
  const [qrCodeName, setQrCodeName] = useState('');
  // Create refs for the file input elements
  const posterInputRef = useRef(null);
  const qrCodeInputRef = useRef(null);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      if (type === 'poster') {
        setPoster(file);
        setPosterName(fileName);
      } else if (type === 'qrCode') {
        setQrCode(file);
        setQrCodeName(fileName);
      }
    }
  };

  const handleDeleteFile = (type) => {
    if (type === 'poster') {
      setPoster(null);
      setPosterName('');
    } else if (type === 'qrCode') {
      setQrCode(null);
      setQrCodeName('');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        backgroundColor: '#ffffff',
        maxWidth: '800px',
        margin: '20px auto',
        borderRadius: '12px',
      }}
    >
      <Typography variant="h5" align="center" sx={{ marginBottom: 3 }}>
        Add a New Event
      </Typography>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Left Side */}
        <Box sx={{ flex: 1 }}>
          <FormField
            title="Event Name"
            type="text"
            placeholder="Enter event name"
            value={eventName}
            onChange={setEventName}
          />
          <FormField
            title="Location"
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={setLocation}
          />
          <FormField
            title="AR Toggle"
            type="switch"
            value={isArEnabled}
            onChange={setIsArEnabled}
          />

          {/* Conditional Venue and GPS Location Fields */}
          {isArEnabled && (
            <>
              <FormField
                title="Venue Name"
                type="text"
                placeholder="Enter main location"
                value={venueName}
                onChange={setVenueName}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormField
                  title="Latitude"
                  type="text"
                  placeholder="Enter latitude"
                  value={latitude}
                  onChange={setLatitude}
                />
                <FormField
                  title="Longitude"
                  type="text"
                  placeholder="Enter longitude"
                  value={longitude}
                  onChange={setLongitude}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Right Side */}
        <Box sx={{ flex: 1 }}>
          <FormField
            title="Organizer Name"
            type="text"
            placeholder="Enter organizer name"
            value={organizerName}
            onChange={setOrganizerName}
          />
          <FormField
            title="Event Type"
            type="radio"
            value={isPaid ? 'paid' : 'free'}
            onChange={(value) => setIsPaid(value === 'paid')}
            options={[
              { label: 'Paid', value: 'paid' },
              { label: 'Free', value: 'free' },
            ]}
          />

          {/* QR Code Upload for Event */}

          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <TextField
              label="QR Code Name"
              value={qrCodeName}
              placeholder="No file uploaded"
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
                style: { backgroundColor: '#f5f5f5' },
              }}
              sx={{ marginRight: 2 }}
            />
            <Button
              variant="contained"
              component="span"
              onClick={() => qrCodeInputRef.current.click()}
            >
              Upload
            </Button>
            {qrCodeName && (
              <IconButton
                color="error"
                onClick={() => handleDeleteFile('qrCode')}
                sx={{ marginLeft: 1 }}
              >
                <CloseIcon />
              </IconButton>
            )}
            <input
              id="qr-code-upload"
              type="file"
              ref={qrCodeInputRef}
              onChange={(e) => handleFileChange(e, 'qrCode')}
              style={{ display: 'none' }}
            />
          </Box>

          {/* poster upload for event */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <TextField
              label="Poster Name"
              value={posterName}
              placeholder="No file uploaded"
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
                style: { backgroundColor: '#f5f5f5' },
              }}
              sx={{ marginRight: 2 }}
            />
            <Button
              variant="contained"
              component="span"
              onClick={() => posterInputRef.current.click()}
            >
              Upload
            </Button>
            {posterName && (
              <IconButton
                color="error"
                onClick={() => handleDeleteFile('poster')}
                sx={{ marginLeft: 1 }}
              >
                <CloseIcon />
              </IconButton>
            )}
            <input
              id="poster-upload"
              type="file"
              ref={posterInputRef}
              onChange={(e) => handleFileChange(e, 'poster')}
              style={{ display: 'none' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Add Event Button */}
      <Box sx={{ textAlign: 'center', marginTop: 3 }}>
        <Button variant="contained" color="primary">
          Add Event
        </Button>
      </Box>
    </Paper>
  );
}

export default EventForm;
