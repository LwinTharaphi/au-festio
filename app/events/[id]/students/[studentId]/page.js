'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';

export default function StudentDetails() {
    const { id: eventId, studentId } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'organizer') {
            router.push('/');
            return;
        }

        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/events/${eventId}/students/${studentId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch student details.');
                }
                const data = await response.json();
                setStudent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated' && eventId && studentId) {
            fetchStudentDetails();
        }
    }, [eventId, studentId, session, status, router]);

    const handleConfirm = async () => {
        try {
            const response = await fetch(`/api/events/${id}/students/${studentId}/checkin`, {
                method: 'POST',
            });
            if (response.ok) {
                alert('Check-in successful!');
                router.push(`/events/${eventId}/students`);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            alert('An error occurred during check-in.');
        }
    };

    const handleCancel = () => {
        router.push(`/events/${eventId}/students`);
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    {loading && (
                        <div className="text-center">
                            <Spinner animation="border" variant="primary" />
                            <p>Loading...</p>
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {!loading && !error && student && (
                        <Card>
                            <Card.Header as="h5" className="text-center">
                                Student Details
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    <strong>Name:</strong> {student.name}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Email:</strong> {student.email}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Status:</strong> {student.status}
                                </Card.Text>
                                <div className="d-flex justify-content-between mt-4">
                                    <Button variant="success" onClick={handleConfirm}>
                                        Confirm Check-In
                                    </Button>
                                    <Button variant="secondary" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                    {!loading && !error && !student && (
                        <Alert variant="warning">Student not found.</Alert>
                    )}
                </Col>
            </Row>
        </Container>
    );
}
