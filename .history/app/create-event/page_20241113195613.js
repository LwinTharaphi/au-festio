"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Paper, Typography, TextField, 
  IconButton, Card, CardContent, CardActions, 
  CardActionArea, CardMedia,
  Grid, Menu, MenuItem} from '@mui/material';
import FormField from '../components/FormField';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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

  const [events, setEvents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For menu anchor
  const [selectedEventIndex, setSelectedEventIndex] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (event.target.name === 'poster') {
      setPoster(file);
      setPosterName(file.name);
    } else if (event.target.name === 'qrCode') {
      setQrCode(file);
      setQrCodeName(file.name);
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

  useEffect(()=>{
    const fetchEvents = async()=>{
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    };
    fetchEvents();
  },[]);

  const handleSubmit = async() => {
    event.preventDefault();
    const formData = new FormData();
    
    formData.append('eventName', eventName);
    formData.append('location', location);
    formData.append('venueName', venueName);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('organizerName', organizerName);
    formData.append('isPaid', isPaid);
    formData.append('posterName', posterName);
    formData.append('qrCodeName', qrCodeName);
    if (poster) formData.append('poster', poster);
    if (qrCode) formData.append('qrCode', qrCode);

    try {
      let response;

      if (isEditing) {
        // Update the existing event only if editing
        const eventId = events[selectedEventIndex]?._id;
        console.log(eventId)
        response = await fetch(`/api/events/${eventId}`,{
          method: 'PUT',
          body: formData,
        });
      } else {
         // Create a new event if not editing
        response = await fetch('/api/events', {
          method: 'POST',
          body: formData,
        });
      } 

      if (response.ok) {
        const eventData = await response.json();
        console.log('Event successfully saved:', eventData);
  
        if (isEditing) {
          // Update the events list with the modified event
          const updatedEvents = [...events];
          updatedEvents[selectedEventIndex] = newEvent;
          setEvents(updatedEvents); // Update events state
          setIsEditing(false); // Reset edit mode
        } else {
          // Add the new event to the list
          setEvents((prevEvents) => [...prevEvents, eventData]);
        }
  
        // Reset form
        setEventName('');
        setLocation('');
        setVenueName('');
        setLatitude('');
        setLongitude('');
        setOrganizerName('');
        setPoster(null);
        setQrCode(null);
        setPosterName('');
        setQrCodeName('');
      } else {
        console.error('Error saving event:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const handleDelete = (index) => {
    setEvents(events.filter((_, i) => i !== index)); // Remove event at the given index
    setAnchorEl(null); // Close the menu after deletion
  };

  const handleEdit = (index) => {
    const eventToEdit = events[index];
    setEventName(eventToEdit.eventName);
    setLocation(eventToEdit.location);
    setVenueName(eventToEdit.venueName);
    setLatitude(eventToEdit.latitude);
    setLongitude(eventToEdit.longitude);
    setOrganizerName(eventToEdit.organizerName);
    setPosterName(eventToEdit.posterName);
    setQrCodeName(eventToEdit.qrCodeName);
    setSelectedEventIndex(index); // Store the index for saving the updated event later
    setAnchorEl(null); // Close the menu after edit
    setIsEditing(true);

     // Preserve the current poster if it's already uploaded
    if (eventToEdit.posterName) {
      // If there's already a poster, set the file state (file reference)
      setPoster(eventToEdit.posterName);
    }

    if (eventToEdit.qrCodeName){
      setQrCode(eventToEdit.qrCodeName);
    }
  };

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedEventIndex(index);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null); // Close the menu
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        backgroundColor: '#ffffff',
        maxWidth: '1200px',
        margin: 'auto auto',
      }}
    >
      <Typography variant="h5" align="center" sx={{ marginBottom: 3 }}>
        {isEditing ? 'Edit Event' : 'Add a New Event'}
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
              key={isEditing ? 'editing' : 'new'}  // Reset the file input when editing
              onChange={(e) => handleFileChange(e, 'poster')}
              style={{ display: 'none' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Add Event Button */}
      <Box sx={{ textAlign: 'center', marginTop: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {isEditing ? 'Update Event' : 'Add Event'}
        </Button>
      </Box>

      {/* Event List as Cards */}
      {events.length > 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Grid container spacing={4}>
            {events.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ position: 'relative', marginBottom: 2 }} key={index}>
                  <CardActionArea>
                    {event.posterName && (
                      <CardMedia 
                        component="img"
                        height="140"
                        image={
                          event.poster
                            ? typeof event.poster === "object" && event.poster !== null && (event.poster instanceof Blob || event.poster instanceof File)
                              ? URL.createObjectURL(event.poster) // Create object URL if it's a file
                              : event.poster // Use the URL directly if it's already a string
                            : ""
                        }
                        alt={event.posterName}
                      />
                    )}
                  </CardActionArea>
                  <CardContent>
                    <Typography variant="h6" align='center'>{event.eventName}</Typography>
                  </CardContent>
                  {/* Delete Button */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  >
                    <IconButton 
                      onClick={(e) => handleMenuClick(e, index)}
                      sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Menu with options for delete/edit */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={() => handleDelete(selectedEventIndex)}>Delete</MenuItem>
                    <MenuItem onClick={() => handleEdit(selectedEventIndex)}>Edit</MenuItem>
                  </Menu>
                </Card>
              </Grid>
            ))}
          </Grid>
          
        </Box>
      )}
    </Paper>
  );
}

export default EventForm;
