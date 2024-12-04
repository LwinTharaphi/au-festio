"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Paper, Typography, TextField, 
  IconButton, Card, CardContent, CardActions, 
  CardActionArea, CardMedia,
  Grid, Menu, MenuItem,
  Fab, Modal} from '@mui/material';
import FormField from '../../../components/FormField';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
// import dayjs from 'dayjs';
import moment from "moment";
import Sidebar from '../../../components/general-sidebar';

function EventForm() {
  const router = useRouter();

  const [isArEnabled, setIsArEnabled] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [eventName, setEventName] = useState('');
  const [registerationDate, setRegisterationDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [poster, setPoster] = useState(null);
  const [posterName, setPosterName] = useState('');
  const [qr, setQr] = useState(null);
  const [qrName, setQrName] = useState('');
  // Create refs for the file input elements
  const posterInputRef = useRef(null);
  const qrInputRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For menu anchor
  const [selectedEventIndex, setSelectedEventIndex] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);

  const [hasSeatLimitation, setHasSeatLimitation] = useState(false);
  const [seatAmount, setSeatAmount] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDeleteIndex, setEventToDeleteIndex] = useState(null);

  const [refresh, setRefresh] = useState(false); // Trigger re-fetch


  const [startTimeDisplay, setStartTimeDisplay] = useState(""); // Holds 12-hour format
  const [endTimeDisplay, setEndTimeDisplay] = useState("");

  const handleFabClick = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (file) {     
      if (type === 'poster') {
        setPoster(file);
        setPosterName(file.name);
      } else if (type === 'qr') {
        setQr(file);
        setQrName(file.name);
      }
    }
  };
  

  const handleDeleteFile = (type) => {
    if (type === 'poster') {
      setPoster(null);
      setPosterName('');
    } else if (type === 'qr'){
      setQr(null);
      setQrName('');
    }
  };

  const handleStartTimeChange = (newTime) => {
    setStartTime(newTime); // Store in 24-hour format
    setStartTimeDisplay(formatTimeTo12Hour(newTime)); // Update the display format
  };
  
  const handleEndTimeChange = (newTime) => {
    setEndTime(newTime);
    setEndTimeDisplay(formatTimeTo12Hour(newTime));
  };
  

  useEffect(()=>{
    const fetchEvents = async()=>{
      const response = await fetch(`/api/events`);
      const data = await response.json();
      const sortedEvents = data.sort((a,b)=>
      new Date(a.registerationDate) - new Date(b.registerationDate));
      setEvents(sortedEvents);
    };
    fetchEvents();
  },[refresh]);

  const refreshEvents = () => setRefresh(!refresh);

  const categorizeEvents = (events) => {
    const today = moment();
    const groupedEvents = { ongoing: {}, upcoming: {}, completed: {} };
  
    events.forEach((event, index) => {
      const registrationDate = moment(event.registerationDate);
      const eventDate = moment(event.eventDate);
      console.log(`Event: ${event.eventName}`);
      console.log("Registration Date:", registrationDate.format("DD/MM/YYYY"));
      console.log("Event Date:", eventDate.format("DD/MM/YYYY"));
  
      let status = "";
      if (today.isBetween(registrationDate, eventDate, "day", "[]")) {
        status = "ongoing";
        console.log("Status: Ongoing");
      } else if (today.isBefore(registrationDate, "day")) {
        status = "upcoming";
        console.log("Status: Upcoming");
      } else if (today.isAfter(eventDate, "day")) {
        status = "completed";
        console.log("Status: Completed");
      }
  
      if (status) {
        const month = eventDate.format("MMMM YYYY");
        if (!groupedEvents[status][month]) {
          groupedEvents[status][month] = [];
        }
  
        // Add the index to the event so we can access it later during edit
        const eventWithIndex = { ...event, _index: index };
        groupedEvents[status][month].push(eventWithIndex);
      }
    });
  
    return groupedEvents;
  };
  
  
  
  const groupedEvents = categorizeEvents(events);
  console.log("Grouped events",groupedEvents)

  const handleSubmit = async(event) => {
    event.preventDefault(); // Prevent the default form submission

    // Create a FormData object to append all form data, including file uploads
    const formData = new FormData();

    formData.append('eventName',eventName || '');
    formData.append('registerationDate',registerationDate || '');
    formData.append('eventDate',eventDate || '');
    // console.log(eventDate)
    formData.append('startTime',startTime || '');
    formData.append('endTime',endTime || '');
    formData.append('location',location || '');
    formData.append('isPaid',isPaid);
    formData.append('posterName',posterName || '');

    if (isPaid){
      formData.append('qrName', qrName || '');
    }

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

    if (qr) {
      formData.append('qr',qr);
    }
    formData.append('hasSeatLimitation', hasSeatLimitation);
    if (hasSeatLimitation) {
      formData.append('seats', seatAmount || '');
    }

    try {
      let response;

      if (isEditing) {
        // Update the existing event only if editing
        const eventId = events[selectedEventIndex]._id;
        // console.log(eventId)
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
        refreshEvents();
        resetForm();
        setShowModal(false);
      } else {
        console.error('Error saving event:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };
  const resetForm = () => {
    setEventName('');
    setRegisterationDate('');
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setVenueName('');
    setLatitude('');
    setLongitude('');
    setPoster(null);
    setPosterName('');
    setQr(null);
    setQrName('');
    setIsArEnabled(false);
    setIsPaid(false);
    setSelectedEventIndex(null);
    setIsEditing(false);
    setHasSeatLimitation(false);
    setSeatAmount('');
  };

  const handleDelete = async (index) => {
    // console.log("deleted index",index)
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
    refreshEvents();
    setAnchorEl(null); // Close the menu
  };

  const handleEdit = () => {
    // console.log('Editing event with index:', eventIndex);
    const eventToEdit = events[selectedEventIndex]
    console.log(eventToEdit)
    // Format the date to YYYY-MM-DD (compatible with HTML date input)
    const formattedDate = eventToEdit.registerationDate 
      ? new Date(eventToEdit.registerationDate).toISOString().split('T')[0]
      : '';
    const eventDateFormatted = eventToEdit.eventDate
      ? new Date(eventToEdit.eventDate).toISOString().split('T')[0]
      : '';
    // console.log(eventDateFormatted);
    setEventName(eventToEdit.eventName || '');
    setRegisterationDate(formattedDate || '');
    setEventDate(eventDateFormatted || '');
    // console.log(eventToEdit.startTime)
    setStartTime(eventToEdit.startTime);
    setEndTime(eventToEdit.endTime)
    setStartTimeDisplay(eventToEdit.startTime ? formatTimeTo12Hour(eventToEdit.startTime) : '')
    setEndTimeDisplay(eventToEdit.endTime ? formatTimeTo12Hour(eventToEdit.endTime) : '')
    setLocation(eventToEdit.location || '');
    setVenueName(eventToEdit.venueName || '');
    setLatitude(eventToEdit.latitude || '');
    setLongitude(eventToEdit.longitude || '');
    setPosterName(eventToEdit.posterName || '');
    setQrName(eventToEdit.qrName || '');
    setIsArEnabled(Boolean(eventToEdit.venueName));
    setIsPaid(eventToEdit.isPaid || false);
    // setSelectedEventIndex(); // Store the index for saving the updated event later
    setAnchorEl(null); // Close the menu after edit
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = () => {
    console.log("deleted index",eventToDeleteIndex)
    // setEventToDeleteIndex(index);
    setDeleteModalOpen(true); // Open the delete confirmation modal
    setAnchorEl(null); // Close the menu
  };

  const handleMenuClick = (event, index) => {
    console.log(index)
    setAnchorEl(event.currentTarget);
    setSelectedEventIndex(index);
    setEventToDeleteIndex(index)
    console.log("events",events)
  };

  const handleCloseMenu = () => {
    setAnchorEl(null); // Close the menu
    setEventToDeleteIndex('');
  };

  // Convert 24-hour time format to 12-hour AM/PM format
  const formatTimeTo12Hour = (time24) => {
    const [hour, minute] = time24.split(":").map(Number);
    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12; // Convert to 12-hour format
    const suffix = isPM ? "PM" : "AM";
  
    return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
  };

  // Update the useEffect hook to log the selected event after the state change
  useEffect(() => {
    if (selectedEventIndex !== null) {
      console.log('Selected event index updated:', selectedEventIndex);
      console.log('Event at selected index:', events[selectedEventIndex]);  // Access the selected event
    }
  }, [selectedEventIndex, events]);
  

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '250px', // Sidebar width
          bgcolor: '#ffffff',
          boxShadow: 2,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1, // Take up remaining space
          padding: 4,
        }}
      >
    
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
            Event List
          </Typography>

          {/* Event List by Status */}
          {Object.keys(groupedEvents).length > 0 ? (
            ["ongoing", "upcoming", "completed"].map((status) => (
              Object.keys(groupedEvents[status] || {}).length > 0 ? (
                <Box key={status} sx={{ marginTop: 4 }}>
                  <Typography variant="h5" sx={{ marginBottom: 3 }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)} Events
                  </Typography>
                  {Object.entries(groupedEvents[status]).map(([month, events], monthIndex) => (
                    <Box key={monthIndex} sx={{ marginTop: 2 }}>
                      <Typography variant="h6" sx={{ marginBottom: 2 }}>
                        {month} Events
                      </Typography>
                      <Grid container spacing={4}>
                        {events.map((event, eventIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={event._index}>
                            <Card sx={{ position: "relative", marginBottom: 2 }}>
                              <CardActionArea onClick={() => router.push(`/events/${event._id}/dashboard`)}>
                                {event.posterName && (
                                  <CardMedia
                                    component="img"
                                    height="140"
                                    image={event.poster} // Ensure the correct URL is set for images
                                    alt={event.posterName}
                                  />
                                )}
                              </CardActionArea>
                              <CardContent>
                                <Typography variant="h6" align="center">
                                  {event.eventName}
                                </Typography>
                              </CardContent>
                              {/* Delete Button */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                }}
                              >
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("menu click",event._index)
                                    handleMenuClick(e, event._index);
                                  }}
                                  sx={{ color: "rgba(0, 0, 0, 0.54)" }}
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
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                              >
                                <MenuItem
                                  onClick={() => {
                                    console.log("delete confirm",eventIndex)
                                    confirmDelete();
                                  }}
                                >
                                  Delete
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) => {
                                    console.log("clicked edit",event._index)
                                    handleEdit();
                                  }}
                                >
                                  Edit
                                </MenuItem>
                              </Menu>
                            </Card>
                            <Typography variant="h6" align="center">
                              Registeration Date: {new Date(event.registerationDate).toISOString().split('T')[0]}
                            </Typography>
                            <Typography variant="h6" align="center">
                              Evnent Date: {new Date(event.eventDate).toISOString().split('T')[0]}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography key={status} variant="body1" align="center" sx={{ marginTop: 3 }}>
                  No {status} events available.
                </Typography>
              )
            ))
          ) : (
            <Typography variant="body1" align="center">
              No events available.
            </Typography>
          )}

          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={handleFabClick}
          >
            <AddIcon />
          </Fab>

          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                width: "90%", // Adjusts the width
                maxWidth: "600px", // Limits to max-width
                maxHeight: "90vh", // Makes it scrollable
                overflowY: "auto", // Adds scrolling
                p: 4,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 id="modal-title">{isEditing ? "Edit Event" : "Add a New Event"}</h2>
                <IconButton color="error" onClick={() => setShowModal(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box id="modal-description" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Event Form Fields */}
                <Box>
                  <FormField
                    title="Event Name"
                    type="text"
                    placeholder="Enter event name"
                    value={eventName}
                    onChange={setEventName}
                  />
                  <FormField
                    title="Registration Date"
                    type="date"
                    value={registerationDate}
                    onChange={setRegisterationDate}
                  />
                  <FormField 
                    title="Event Date"
                    type="date"
                    value={eventDate}
                    onChange={setEventDate}
                  />
                  <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
                    Event Time:
                  </Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FormField
                      title=""
                      type="time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                    />
                    <Typography variant="body1">TO</Typography>
                    <FormField
                      title=""
                      type="time"
                      value={endTime || ""}
                      onChange={handleEndTimeChange}
                    />
                  </div>
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
                      <Box sx={{ display: "flex", gap: 2 }}>
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
                {/* Poster Upload */}
                <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                  <TextField
                    label="Poster Name"
                    value={posterName || ""}
                    placeholder="No file uploaded"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      style: { backgroundColor: "#f5f5f5" },
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
                      onClick={() => handleDeleteFile("poster")}
                      sx={{ marginLeft: 1 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                  <input
                    id="poster-upload"
                    type="file"
                    ref={posterInputRef}
                    key={isEditing ? "editing" : "new"} // Reset the file input when editing
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "poster")}
                    style={{ display: "none" }}
                  />
                </Box>

                {/* Other Fields */}
                <FormField
                  title="Event Type"
                  type="radio"
                  value={isPaid ? "paid" : "free"}
                  onChange={(value) => setIsPaid(value === "paid")}
                  options={[
                    { label: "Free", value: "free" },
                    { label: "Paid", value: "paid" },
                  ]}
                />
                {isPaid && (
                  <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                    <TextField
                      label="QR Name"
                      value={qrName || ""}
                      placeholder="No file uploaded"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        style: { backgroundColor: "#f5f5f5" },
                      }}
                      sx={{ marginRight: 2 }}
                    />
                    <Button
                      variant="contained"
                      component="span"
                      onClick={() => qrInputRef.current.click()}
                    >
                      Upload
                    </Button>
                    {qrName && (
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteFile("qr")}
                        sx={{ marginLeft: 1 }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                    <input
                      id="qr-upload"
                      type="file"
                      ref={qrInputRef}
                      key={isEditing ? "editing" : "new"} // Reset the file input when editing
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "qr")}
                      style={{ display: "none" }}
                    />
                </Box>
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
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 3 }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                  {isEditing ? "Update Event" : "Add Event"}
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal
            open={deleteModalOpen}
            onClose={() =>{
              setEventToDeleteIndex('')
              setDeleteModalOpen(false)}}
            aria-labelledby="delete-confirmation-title"
            aria-describedby="delete-confirmation-description"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                width: "90%",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              <Typography id="delete-confirmation-title" variant="h6" gutterBottom>
                Confirm Delete
              </Typography>
              <Typography id="delete-confirmation-description" variant="body1" gutterBottom>
                Are you sure you want to delete this event? This action cannot be undone.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-around", marginTop: 3 }}>
                <Button variant="outlined" color="primary" onClick={() => {setEventToDeleteIndex('');setDeleteModalOpen(false)}}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleDelete(eventToDeleteIndex);
                    setDeleteModalOpen(false);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Modal>

        </Paper>
      </Box>
    </Box>
  );
}

export default EventForm;
