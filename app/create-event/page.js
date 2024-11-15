"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Paper, Typography, TextField, 
  IconButton, Card, CardContent, CardActions, 
  CardActionArea, CardMedia,
  Grid, Menu, MenuItem} from '@mui/material';
import FormField from '../components/FormField';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/navigation';

function EventForm() {
  const router = useRouter();

  const [isArEnabled, setIsArEnabled] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [poster, setPoster] = useState(null);
  const [posterName, setPosterName] = useState('');
  // Create refs for the file input elements
  const posterInputRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For menu anchor
  const [selectedEventIndex, setSelectedEventIndex] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);

  const [hasSeatLimitation, setHasSeatLimitation] = useState(false);
  const [seatAmount, setSeatAmount] = useState('');
  const [hasFoodBooth, setHasFoodBooth] = useState(false);
  const [foodBoothAmount, setFoodBoothAmount] = useState('');
  const [ticketAmount, setTicketAmount] = useState(''); // For paid events

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (file) {     
      if (type === 'poster') {
        setPoster(file);
        setPosterName(file.name);
      }
    }
  };
  

  const handleDeleteFile = (type) => {
    if (type === 'poster') {
      setPoster(null);
      setPosterName('');
    }
  };

  useEffect(()=>{
    const fetchEvents = async()=>{
      const response = await fetch(`/api/events`);
      const data = await response.json();
      setEvents(data);
    };
    fetchEvents();
  },[]);

  const handleSubmit = async(event) => {
    event.preventDefault(); // Prevent the default form submission

    // Create a FormData object to append all form data, including file uploads
    const formData = new FormData();

    formData.append('eventName',eventName || '');
    formData.append('location',location || '');
    formData.append('isPaid',isPaid);
    formData.append('posterName',posterName || '');

    // Add additional fields for AR
    if (isArEnabled) {
      formData.append('venueName', venueName || '');
      formData.append('latitude', latitude || '');
      formData.append('longitude', longitude || '');
    }

     // Append the file data (poster and QR code, if present)
    if (poster) {
      formData.append('poster', poster); // Assuming 'poster' is the file data
    }

    formData.append('hasSeatLimitation', hasSeatLimitation);
    if (hasSeatLimitation) {
      formData.append('seats', seatAmount || '');
    }

    formData.append('hasFoodBooth', hasFoodBooth);
    if (hasFoodBooth) {
      formData.append('booths', foodBoothAmount || '');
    }

    if (isPaid) {
      formData.append('price', ticketAmount || '');
    }

    try {
      let response;

      if (isEditing) {
        // Update the existing event only if editing
        const eventId = events[selectedEventIndex]._id;
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
          updatedEvents[selectedEventIndex] = eventData;
          setEvents(updatedEvents); // Update events state
          setIsEditing(false); // Reset edit mode
        } else {
          // Add the new event to the list
          setEvents((prevEvents) => [...prevEvents, eventData]);
        }
        resetForm();
      } else {
        console.error('Error saving event:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };
  const resetForm = () => {
    setEventName('');
    setLocation('');
    setVenueName('');
    setLatitude('');
    setLongitude('');
    setPoster(null);
    setPosterName('');
    setIsArEnabled(false);
    setIsPaid(false);
    setSelectedEventIndex(null);
    setIsEditing(false);
    setHasSeatLimitation(false);
    setSeatAmount('');
    setHasFoodBooth(false);
    setFoodBoothAmount('');
    setTicketAmount('');
  };

  const handleDelete = async (index) => {
    const eventId = events[index]._id;  // Get event id for deletion
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEvents((prevEvents) => prevEvents.filter((_, i) => i !== index)); // Remove event from state
      } else {
        console.error('Failed to delete event:', response.statusText);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
    setAnchorEl(null); // Close the menu
  };

  const handleEdit = (index) => {
    const eventToEdit = events[index];
    setEventName(eventToEdit.eventName || '');
    setLocation(eventToEdit.location || '');
    setVenueName(eventToEdit.venueName || '');
    setLatitude(eventToEdit.latitude || '');
    setLongitude(eventToEdit.longitude || '');
    setPosterName(eventToEdit.posterName || '');
    setIsArEnabled(Boolean(eventToEdit.venueName));
    setIsPaid(eventToEdit.isPaid || false);
    setSelectedEventIndex(index); // Store the index for saving the updated event later
    setAnchorEl(null); // Close the menu after edit
    setIsEditing(true);
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
          {/* poster upload for event */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <TextField
              label="Poster Name"
              value={posterName || ''}
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
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'poster')}
              style={{ display: 'none' }}
            />
          </Box>

          <FormField
            title="Event Type"
            type="radio"
            value={isPaid ? 'paid' : 'free'}
            onChange={(value) => setIsPaid(value === 'paid')}
            options={[
              { label: 'Free', value: 'free' },
              { label: 'Paid', value: 'paid' },
            ]}
          />
          {isPaid && (
            <FormField
              title="Ticket Amount"
              type="number"
              placeholder="Enter number of tickets"
              value={ticketAmount}
              onChange={setTicketAmount}
            />
          )}
          <FormField
            title="Seat Limitation"
            type="switch"
            value={hasSeatLimitation}
            onChange={setHasSeatLimitation}
          />
          {hasSeatLimitation && (
            <FormField
              title="Seat Amount"
              type="number"
              placeholder="Enter number of seats"
              value={seatAmount}
              onChange={setSeatAmount}
            />
          )}
          <FormField
            title="Food Booth"
            type="switch"
            value={hasFoodBooth}
            onChange={setHasFoodBooth}
          />
          {hasFoodBooth && (
            <FormField
              title="Food Booth Amount"
              type="number"
              placeholder="Enter number of food booths"
              value={foodBoothAmount}
              onChange={setFoodBoothAmount}
            />
          )}
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
                  <CardActionArea onClick={()=> router.push(`/events/${event._id}/staffs`)}>
                    {event.posterName && (
          
                      <CardMedia 
                        component="img"
                        height="140"
                        image={event.poster} 
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
                      onClick={(e) =>{
                        e.stopPropagation();
                        handleMenuClick(e, index);}}
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
                    <MenuItem onClick={() =>{
                      handleDelete(selectedEventIndex)}
                    }>Delete</MenuItem>
                    <MenuItem onClick={() =>{
                      handleEdit(selectedEventIndex)}}>Edit</MenuItem>
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
