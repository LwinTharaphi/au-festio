"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter} from "next/navigation";
import { Container, Row, Col, Table, Button, Form, Spinner } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar";
import "../../../components/Sidebar.css";
import { useSession } from 'next-auth/react';
import { useNotifications } from "../../../NotificationProvider";

export default function NotificationPage() {
    // const {data: session, status} = useSession();
    // const router = useRouter();
    // const { id } = useParams(); // Fetch event ID from route
    // const userId = session?.user?.id;
    // const [students, setStudents] = useState([]);
    // const [selectedStudents, setSelectedStudents] = useState([]);
    // const [notificationTitle, setNotificationTitle] = useState("");
    // const [notificationBody, setNotificationBody] = useState("");
    // const [selectAll, setSelectAll] = useState(false);
    // const [eventName, setEventName] = useState("");
    // const [loading, setLoading] = useState(false);
    // const [notifications, setNotifications] = useState([]);

    // // Fetch event and student data
    // useEffect(() => {
    //     if (status === "loading") return;  // Don't redirect while loading
    //     if (status === 'unauthenticated' || session?.user?.role !== "organizer"){
    //       router.push('/')
    //     }
    //       if (status === 'authenticated' && session?.user && session.user.role === "organizer"){
    //         const userId = session.user.id
    //         if(userId){
    //             const fetchNotifications = async () => {
    //                 try {
    //                     const response = await fetch(`/api/organizers/${userId}/notifications`);
    //                     if (!response.ok) {
    //                         throw new Error("Failed to fetch notifications.");
    //                     }
    //                     const data = await response.json();
    //                     setNotifications(data);
    //                 } catch (error) {
    //                     console.error("Error fetching notifications:", error);
    //                 }
    //             };
    //             const eventSource = new EventSource(`/api/organizers/${userId}/notifications`);
    //             eventSource.onmessage = (event) => {
    //                 const newNotification = JSON.parse(event.data);
    //                 setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    //                 console.log("New notification:", newNotification);
    //                 alert(`New notification: ${newNotification.title}`);
    //             };
    //             eventSource.onerror = (error) => {
    //                 console.error("EventSource failed:", error);
    //                 eventSource.close();
    //             };
    //             // const fetchEventData = async () => {
    //             //     try {
    //             //         setLoading(true);
    //             //         const response = await fetch(`/api/organizers/${userId}/events/${id}`);
    //             //         if (!response.ok) {
    //             //             throw new Error("Failed to fetch event data.");
    //             //         }
    //             //         const event = await response.json();
    //             //         setEventName(event.eventName || "Event");
    //             //     } catch (error) {
    //             //         console.error("Error fetching event data:", error);
    //             //     } finally {
    //             //         setLoading(false);
    //             //     }
    //             // };
        
    //             // const fetchStudents = async () => {
    //             //     try {
    //             //         const response = await fetch(`/api/organizers/${userId}/events/${id}/students`);
    //             //         if (!response.ok) {
    //             //             throw new Error("Failed to fetch students.");
    //             //         }
    //             //         const data = await response.json();
    //             //         setStudents(data);
    //             //     } catch (error) {
    //             //         console.error("Error fetching students:", error);
    //             //     }
    //             // };
    //             fetchNotifications();
    //             // fetchEventData();
    //             // fetchStudents();
    //             return () => {
    //                 eventSource.close();
    //             };
    //         }
    //       }
        
    // }, [id,router,session,status]);

    // // Handle "Select All" toggle
    // const handleSelectAll = () => {
    //     setSelectAll(!selectAll); // Toggle the state
    //     setSelectedStudents(!selectAll ? students.map((student) => student.id) : []); // Select or deselect all
    // };

    // // Handle individual checkbox toggle
    // const handleCheckboxChange = (studentId) => {
    //     setSelectedStudents((prevSelected) => {
    //         const isSelected = prevSelected.includes(studentId);
    //         return isSelected
    //             ? prevSelected.filter((id) => id !== studentId) // Deselect
    //             : [...prevSelected, studentId]; // Select
    //     });
    // };

    // // Send notification to individual student
    // const handleSendNotification = async (studentId) => {
    //     try {
    //         await fetch(`/api/organizers/${userId}/events/${id}/notifications`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 studentId,
    //                 title: notificationTitle,
    //                 body: notificationBody,
    //             }),
    //         });
    //         alert(`Notification sent to student ID: ${studentId}`);
    //     } catch (error) {
    //         console.error("Error sending notification:", error);
    //     }
    // };

    // // Send notifications to all selected students
    // const handleSendAll = async () => {
    //     try {
    //         await fetch(`/api/organizers/${userId}/events/${id}/notifications/bulk`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 studentIds: selectedStudents,
    //                 title: notificationTitle,
    //                 body: notificationBody,
    //             }),
    //         });
    //         alert("Notifications sent to all selected students.");
    //     } catch (error) {
    //         console.error("Error sending bulk notifications:", error);
    //     }
    // };

    // if (status === 'loading'){
    //     return (
    //       <div
    //         style={{
    //           display: "flex",
    //           justifyContent: "center",
    //           alignItems: "center",
    //           height: "100vh",
    //           flexDirection: "column",
    //         }}
    //       >
    //         <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
    //           <span className="visually-hidden">Loading...</span>
    //         </Spinner>
    //         <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
    //           Loading...
    //         </p>
    //       </div>
    //     );
    //   }
    
    // if (status === 'authenticated' && session.user.role === "organizer"){
    //     return (
    //         <div className="container mx-auto p-4">
    //             <Sidebar />
    //             <h1 className="text-2xl font-bold mb-4">Notifications</h1>
    //             <ul className="space-y-4">
    //                 {notifications.length > 0 ? (
    //                 notifications.map((notification) => (
    //                     <li
    //                     key={notification.notificationId}
    //                     className="p-4 bg-gray-100 rounded-md shadow"
    //                     >
    //                     <h2 className="font-semibold">{notification.title}</h2>
    //                     <p className="text-gray-600">{notification.body}</p>
    //                     </li>
    //                 ))
    //                 ) : (
    //                 <p>No notifications yet.</p>
    //                 )}
    //             </ul>
    //             </div>
    //     //     <Container fluid>
    //     //         <Row>
    //     //             {/* Sidebar */}
    //     //             <Col xs={3} md={2} className="sidebar">
    //     //                 <Sidebar event={{ _id: id }} />
    //     //             </Col>
    
    //     //             {/* Main Content */}
    //     //             <Col xs={9} md={10}>
    //     //                 <h3 className="mb-4 mt-1 sticky-header">Send Notifications for {eventName}</h3>
    //     //                 {loading ? (
    //     //                     <div
    //     //                         style={{
    //     //                             display: "flex",
    //     //                             justifyContent: "center",
    //     //                             alignItems: "center",
    //     //                             height: "100vh",
    //     //                             flexDirection: "column",
    //     //                         }}
    //     //                     >
    //     //                         <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
    //     //                             <span className="visually-hidden">Loading...</span>
    //     //                         </Spinner>
    //     //                         <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
    //     //                             Loading...
    //     //                         </p>
    //     //                     </div>
    //     //                 ) : (
    //     //         <>
    //     //                 <div className="notification-form mb-4">
    //     //                     <Form.Group controlId="notificationTitle">
    //     //                         <Form.Label>Notification Title</Form.Label>
    //     //                         <Form.Control
    //     //                             type="text"
    //     //                             placeholder="Enter notification title"
    //     //                             value={notificationTitle}
    //     //                             onChange={(e) => setNotificationTitle(e.target.value)}
    //     //                         />
    //     //                     </Form.Group>
    //     //                     <Form.Group controlId="notificationBody" className="mt-3">
    //     //                         <Form.Label>Notification Body</Form.Label>
    //     //                         <Form.Control
    //     //                             as="textarea"
    //     //                             rows={4}
    //     //                             placeholder="Enter notification body"
    //     //                             value={notificationBody}
    //     //                             onChange={(e) => setNotificationBody(e.target.value)}
    //     //                         />
    //     //                     </Form.Group>
    //     //                 </div>
    
    //     //                 <h2>Registered Students</h2>
    //     //                 <Table hover responsive style={{ fontSize: '0.8rem' }}>
    //     //                     <thead>
    //     //                         <tr>
    //     //                             <th>
    //     //                                 <Form.Check
    //     //                                     type="checkbox"
    //     //                                     checked={selectAll}
    //     //                                     onChange={handleSelectAll}
    //     //                                 />
    //     //                             </th>
    //     //                             <th>ID</th>
    //     //                             <th>Name</th>
    //     //                             <th>Email</th>
    //     //                             <th></th>
    //     //                         </tr>
    //     //                     </thead>
    //     //                     <tbody>
    //     //                         {students.map((student, index) => (
    //     //                             <tr key={student.id || index}>
    //     //                                 <td>
    //     //                                     <Form.Check
    //     //                                         type="checkbox"
    //     //                                         checked={selectedStudents.includes(student.id)}
    //     //                                         onChange={() => handleCheckboxChange(student.id)}
    //     //                                     />
    //     //                                 </td>
    //     //                                 <td>{student.sid}</td>
    //     //                                 <td>{student.name}</td>
    //     //                                 <td>{student.email}</td>
    //     //                                 <td>
    //     //                                     <Button
    //     //                                         variant="primary"
    //     //                                         size="sm"
    //     //                                         onClick={() => handleSendNotification(student.id)}
    //     //                                         disabled={!notificationTitle || !notificationBody}
    //     //                                     >
    //     //                                         Send
    //     //                                     </Button>
    //     //                                 </td>
    //     //                             </tr>
    //     //                         ))}
    //     //                     </tbody>
    
    //     //                 </Table>
    //     //                 <Button
    //     //                     variant="success"
    //     //                     onClick={handleSendAll}
    //     //                     disabled={
    //     //                         selectedStudents.length === 0 || !notificationTitle || !notificationBody
    //     //                     }
    //     //                 >
    //     //                     Send All
    //     //                 </Button>
    //     //                 </>
    //     //  )}
    //     //             </Col>             
    //     //         </Row>          
    //     //     </Container>
    //     ); 
    // }
    // return null;

    const { notifications } = useNotifications();
    return (
        <div>
            <h2>Notification</h2>
            <ul>
            {notifications.map((notification, index) => (
                <li key={index}>{notification.title}</li>
                ))}
            </ul>
        </div>
    )
}
