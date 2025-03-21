"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, TextField,
  IconButton, Card, CardContent, CardActions,
  CardActionArea, CardMedia,
  Grid, Menu, MenuItem,
  Fab, Modal, Divider
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormField from '../../../components/FormField';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter, useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
// import dayjs from 'dayjs';
import moment from "moment";
import Sidebar from '../../../components/general-sidebar';
import { useSession } from 'next-auth/react';
import { Spinner } from 'react-bootstrap';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { HourglassEmpty } from '@mui/icons-material';

function EventForm() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
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
  // Create refs for the file input elements  console
  const posterInputRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For menu anchor
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [hasSeatLimitation, setHasSeatLimitation] = useState(false);
  const [seatAmount, setSeatAmount] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDeleteIndex, setEventToDeleteIndex] = useState(null);
  const [deleteModalContent, setDeleteModalContent] = useState({
    title: "Confirm Delete",
    description: "Are you sure you want to delete this event? This action cannot be undone.",
    showRefundInfo: false,
  });

  const [refresh, setRefresh] = useState(false); // Trigger re-fetch


  const [startTimeDisplay, setStartTimeDisplay] = useState(""); // Holds 12-hour format
  const [endTimeDisplay, setEndTimeDisplay] = useState("");

  const [price, setPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discount, setDiscount] = useState("");
  const [phone, setPhone] = useState("");

  // State to manage refund policy array
  const [refundPolicy, setRefundPolicy] = useState([]);

  const [expandedSection, setExpandedSection] = useState({}); // Expanded sections

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Function to add a new policy
  const addRefundPolicy = () => {
    setRefundPolicy((prevPolicies) => [
      ...prevPolicies,
      { days: "", percentage: "" } // Adding a single new, empty refund policy
    ]);
  };

  // Function to update a specific policy
  const updateRefundPolicy = (index, updatedPolicy) => {
    setRefundPolicy((prevPolicies) => {
      const updatedPolicies = [...prevPolicies];
      updatedPolicies[index] = updatedPolicy;
      return updatedPolicies;
    });
  };

  // Function to remove a specific policy
  const removeRefundPolicy = (index) => {
    setRefundPolicy((prevPolicies) =>
      prevPolicies.filter((_, i) => i !== index)
    );
  };

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
      }
    }
  };

  const handleDeleteFile = (type) => {
    if (type === 'poster') {
      setPoster(null);
      setPosterName('');
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


  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      router.push('/')
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer") {
      const userId = session.user.id
      if (userId) {
        const fetchEvents = async () => {
          const response = await fetch(`/api/organizers/${userId}/events`);
          const data = await response.json();
          console.log("Events data", data)
          const sortedEvents = data.events.sort((a, b) =>
            new Date(a.registerationDate) - new Date(b.registerationDate));
          setEvents(sortedEvents);
        };
        const expandParam = searchParams.get('type');
        if (expandParam) {
          setExpandedSection((prev) => ({ ...prev, [expandParam]: true }));
        }
        fetchEvents();
      }
    }
  }, [refresh, router, session, status, searchParams]);

  const refreshEvents = () => setRefresh(!refresh);

  const categorizeEvents = (events) => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const groupedEvents = { paid: {}, free: {} };

    events.forEach((event, index) => {
      // const registrationDate = moment(event.registerationDate);
      const eventDate = moment(event.eventDate);

      let categories = "";
      console.log("Event paid", event.isPaid)
      if (eventDate > sevenDaysAgo){
        if (event.isPaid) {
          categories = "paid";
        } else {
          categories = "free";
        }
      }
      if (categories) {
        const month = eventDate.format("MMMM YYYY");
        if (!groupedEvents[categories][month]) {
          groupedEvents[categories][month] = [];
        }

        // Add the index to the event so we can access it later during edit
        const eventWithIndex = { ...event, _index: index };
        groupedEvents[categories][month].push(eventWithIndex);
      }
    });

    return groupedEvents;
  };



  const groupedEvents = categorizeEvents(events);
  // console.log("Grouped events",groupedEvents)

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Create a FormData object to append all form data, including file uploads
    const formData = new FormData();
    const userId = session.user.id;

    formData.append('eventName', eventName || '');
    formData.append('registerationDate', registerationDate || '');
    formData.append('eventDate', eventDate || '');
    // console.log(eventDate)
    formData.append('startTime', startTime || '');
    formData.append('endTime', endTime || '');
    formData.append('location', location || '');
    formData.append('isPaid', isPaid);
    formData.append('posterName', posterName || '');

    if (isPaid) {
      formData.append('price', price || '');
      formData.append('phone', phone || '');
      formData.append("refundPolicy", JSON.stringify(refundPolicy || []));
      if (hasDiscount) formData.append('discount', discount || '');
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
        response = await fetch(`/api/organizers/${userId}/events/${eventId}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // Create a new event if not editing
        response = await fetch(`/api/organizers/${userId}/events`, {
          method: 'POST',
          body: formData,
        });
      }

      if (response.ok) {
        const eventData = await response.json();
        console.log('Event successfully saved:');

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
    setIsArEnabled(false);
    setIsPaid(false);
    setPrice('');
    setHasDiscount(false);
    setDiscount('');
    setPhone('');
    setRefundPolicy([]);
    setSelectedEventIndex(null);
    setIsEditing(false);
    setHasSeatLimitation(false);
    setSeatAmount('');
  };

  const handleRefund = async (index) => {
    const userId = session.user.id;
    const eventId = events[index]._id;
    try {
      const response = await fetch(`/api/organizers/${userId}/events/${eventId}/refund`, {
        method: 'POST',
      });
      if (response.ok) {
        console.log('Refund process started successfully');
        refreshEvents();
      } else {
        console.error('Failed to start refund process:', response.statusText);
      }
    } catch(err) {
      console.error('Error starting refund process:', err);
    }
    refreshEvents();
    setAnchorEl(null);
  }

  const handleDelete = async (index) => {
    // console.log("deleted index",index)
    const userId = session.user.id;
    const eventId = events[index]._id;  // Get event id for deletion
    try {
      const response = await fetch(`/api/organizers/${userId}/events/${eventId}`, {
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
    // console.log(eventToEdit)
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
    setIsArEnabled(Boolean(eventToEdit.venueName));
    setIsPaid(eventToEdit.isPaid || false);
    setPrice(eventToEdit.price || '');
    setPhone(eventToEdit.phone || '');
    setHasDiscount(Boolean(eventToEdit.discount && eventToEdit.discount > 0))
    setDiscount(eventToEdit.discount || '');
    setRefundPolicy(Array.isArray(eventToEdit.refundPolicy) ? eventToEdit.refundPolicy : []);
    setHasSeatLimitation(Boolean(eventToEdit.seats && eventToEdit.seats > 0));
    setSeatAmount(eventToEdit.seats || '');
    // setSelectedEventIndex(); // Store the index for saving the updated event later
    setAnchorEl(null); // Close the menu after edit
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async (index) => {
    const eventToDelete = events[index];
    const userId = session.user.id;
    const eventId = eventToDelete._id;
  
    try {
      const response = await fetch(`/api/organizers/${userId}/events/${eventId}/students`);
      const registrations = await response.json();
      const hasPaidStudents = registrations.some(student => student.status === 'paid');
  
      if (eventToDelete.isPaid && registrations.length > 0 && hasPaidStudents && eventToDelete.refundStatus !== "refunded") {
        setDeleteModalContent({
          title: "Confirm Delete",
          description: "This event has registered students. Users will be notified and the refund process will start. Are you sure you want to delete this event?",
          showRefundInfo: true,
        });
      } else {
        setDeleteModalContent({
          title: "Confirm Delete",
          description: "Are you sure you want to delete this event? This action cannot be undone.",
          showRefundInfo: false,
        });
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  
    setEventToDeleteIndex(index);
    setDeleteModalOpen(true);
    setAnchorEl(null);
  };

  const handleMenuClick = (event, index) => {
    // console.log(index)
    setAnchorEl(event.currentTarget);
    setSelectedEventIndex(index);
    setEventToDeleteIndex(index)
    // console.log("events",events)
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

  if (status === 'loading') {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "organizer") {

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minheight: '100vh' }}>
        {/* Navbar at the top */}
        <div className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 1050 }}>
          <Sidebar /> {/* Sidebar component */}
        </div>

        <div style={{ display: 'flex', flex: 1 }}>

          {/* Main Content */}
          <div style={{ display: 'flex', flex: 1, backgroundColor: '#F3EFFD' }}>
            <Box
              sx={{
                flex: 1, // Take up remaining space
                padding: 1,
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
                  ["paid", "free"].map((status) => (
                    Object.keys(groupedEvents[status] || {}).length > 0 ? (
                      <Box key={status} sx={{ marginTop: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleSection(status)}
                        >
                          <Typography sx={{ fontSize: '1.2rem', marginBottom: 3 }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)} Events
                          </Typography>
                          {/* <IconButton>
                            {expandedSection[status] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton> */}
                        </Box>
                        {(
                          Object.entries(groupedEvents[status]).map(([month, events], monthIndex) => (
                            <Box key={monthIndex} sx={{ marginTop: 2 }}>
                              <Typography sx={{ fontSize: '1rem', marginBottom: 3 }}>
                                {month} Events
                              </Typography>
                              <Grid container spacing={2}>
                                {events.map((event, eventIndex) => (
                                  <Grid item xs={12} sm={6} md={4} lg={3} key={event._index}>
                                    <Card sx={{
                                      width: "100%", // Set fixed width
                                      height: 200, // Set fixed height
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "space-between",
                                      position: "relative",
                                      marginBottom: 2,
                                    }}>
                                      <CardActionArea onClick={() => router.push(`/events/${event._id}/dashboard`)}>
                                        {event.posterName && (
                                          <CardMedia
                                            component="img"
                                            sx={{
                                              height: 150,  // Fixed height for images
                                              objectFit: "cover" // Ensures images fill the space properly
                                            }}
                                            image={event.poster} // Ensure the correct URL is set for images
                                            alt={event.posterName}
                                          />
                                        )}
                                      </CardActionArea>
                                      <CardContent>
                                        <Typography sx={{ fontSize: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                                          {event.eventName}
                                          {event.refundStatus === 'refund_in_progress' && (
                                            <HourglassEmptyIcon sx={{ marginLeft: 1, color: 'orange' }} />
                                          )}
                                          {event.refundStatus === 'refunded' && (
                                            <CheckCircleIcon sx={{ marginLeft: 1, color: 'red' }} />
                                          )}
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
                                            // console.log("menu click",event._index)
                                            handleMenuClick(e, event._index);
                                          }}
                                          sx={{ color: "rgba(0, 0, 0, 0.54)" }}
                                        >
                                          <MoreVertIcon />
                                        </IconButton>
                                      </Box>

                                      {/* Menu with options for delete/edit */}
                                      {selectedEventIndex === event._index && (
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
                                            onClick={(e) => {
                                              handleEdit();
                                            }}
                                          >
                                           Edit
                                        </MenuItem>
                                        <Divider />
                                        {event?.refundStatus === "refund_in_progress" ? (
                                          <MenuItem disabled>
                                            Refund in Progress
                                          </MenuItem>
                                        ) : (
                                          <MenuItem
                                            onClick={() => {
                                              confirmDelete(eventToDeleteIndex);
                                            }}
                                          >
                                            Delete
                                          </MenuItem>
                                        )}
                                      </Menu>
                                    )}
                                    </Card>
                                    <Typography sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                      Registeration Deadline: {event.registerationDate
                                        ? new Date(event.registerationDate).toISOString().split('T')[0]
                                        : "Invalid Date"}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                      Event Date: {event.eventDate
                                        ? new Date(event.eventDate).toISOString().split('T')[0]
                                        : "Invalid Date"}
                                    </Typography>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          ))
                        )}
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
                          title="Registration Deadline"
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
                        {/* <FormField
                          title="AR Toggle"
                          type="switch"
                          value={isArEnabled}
                          onChange={setIsArEnabled}
                        /> */}

                        {/* Conditional Venue and GPS Location Fields */}
                        {/* {isArEnabled && (
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
                        )} */}
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
                        <>
                          <TextField
                            label="Price"
                            value={price || ""}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price"
                            variant="outlined"
                            fullWidth
                            sx={{ marginBottom: 2 }}
                          />
                          <TextField
                            label="Phone Number"
                            value={phone || ""}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            variant='outlined'
                            fullWidth
                            sx={{ marginBottom: 2 }}
                          />
                          <FormField
                            title="Early Bird Discount"
                            type="switch"
                            value={hasDiscount}
                            onChange={setHasDiscount}
                          />
                          {hasDiscount && (
                            <FormField
                              title="Discount Percentage"
                              type="number"
                              value={discount}
                              onChange={setDiscount}
                            />
                          )}
                          {Array.isArray(refundPolicy) &&
                            refundPolicy.map((policy, index) => (
                              <Box
                                key={index}
                                sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}
                              >
                                <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
                                  Refund Policy:
                                </Typography>
                                <TextField
                                  label="Days"
                                  type="number"
                                  value={policy.days || ""}
                                  onChange={(e) =>
                                    updateRefundPolicy(index, { ...policy, days: e.target.value })
                                  }
                                  placeholder="Days"
                                  variant="outlined"
                                  fullWidth
                                />
                                <TextField
                                  label="Refund (%)"
                                  type="number"
                                  value={policy.percentage || ""}
                                  onChange={(e) =>
                                    updateRefundPolicy(index, { ...policy, percentage: e.target.value })
                                  }
                                  placeholder="Refund Percentage"
                                  variant="outlined"
                                  fullWidth
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => removeRefundPolicy(index)}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            ))}
                          <Button variant="contained" onClick={addRefundPolicy}>
                            Add Refund Policy
                          </Button>
                        </>
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
                  onClose={() => {
                    setEventToDeleteIndex('')
                    setDeleteModalOpen(false)
                  }}
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
                      {deleteModalContent.title}
                    </Typography>
                    <Typography id="delete-confirmation-description" variant="body1" gutterBottom>
                      {deleteModalContent.description}
                    </Typography>
                    {deleteModalContent.showRefundInfo && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Users will be notified and the refund process will start. The event will remain active until the refund is completed.
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "space-around", marginTop: 3 }}>
                      <Button variant="outlined" color="primary" onClick={() => { setEventToDeleteIndex(''); setDeleteModalOpen(false) }}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color={deleteModalContent.showRefundInfo ? "warning" : "error"}
                        onClick={() => {
                          // handleDelete(eventToDeleteIndex);
                          if (deleteModalContent.showRefundInfo) {
                            // console.log("delete event",eventToDeleteIndex)
                            handleRefund(eventToDeleteIndex);
                          } else {
                            handleDelete(eventToDeleteIndex);
                          }
                          setDeleteModalOpen(false);
                        }}
                      >
                        {deleteModalContent.showRefundInfo ? "Start Refund Process" : "Delete Event"}
                      </Button>
                    </Box>
                  </Box>
                </Modal>

              </Paper>
            </Box>
          </div>
        </div>
      </div>
    );

  }
  return null;

}

export default EventForm;
