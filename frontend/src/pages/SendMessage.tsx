import { useEffect, useState } from "react";
import "./SendMessage.css";

function SendMessage() {
  const [client, setClient] = useState("");
  const [clinic, setClinic] = useState("");
  const [notificationEvent, setNotificationEvent] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [clinics, setClinics] = useState<
    { id: string; clientId: string; name: string }[]
  >([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/clients")
      .then((response) => response.json())
      .then((data) => {
        setClients(data);
      });

    fetch("http://localhost:8080/api/clinics")
      .then((response) => response.json())
      .then((data) => {
        setClinics(data);
      });
  }, []);

  const filteredClinics = clinics.filter(
    (clinic) => clinic.clientId === client
  );

  const notificationEvents = [
    "Appointment Created",
    "Appointment Reminder",
    "Appointment Cancelled",
    "Invoice Generated",
    "Payment Reminder"
  ];

  const handleSendMessage = async () => {
    if (!client || !clinic || !notificationEvent || !recipient || !message) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/messages/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            clientId: client,
            clinicId: clinic,
            event: notificationEvent,
            recipient,
            message
          })
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      if (!data.success) {
        setError(data.message);
        return;
      }

      alert(
        `Message processed successfully via: ${data.channels.join(", ")}`
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Unable to connect to backend.");
    }
  };

  const handleClear = () => {
    setClient("");
    setClinic("");
    setNotificationEvent("");
    setRecipient("");
    setMessage("");
    setError("");
  };

  return (
    <div className="send-message-page">
      <div className="send-page-header">
        <h1>Send Message</h1>
        <p>
          Send a notification based on the configured communication
          preferences.
        </p>
      </div>

      <section className="message-card">
        <div className="message-card-header">
          <h2>Message Details</h2>
          <p>
            Select the notification context and enter recipient information.
          </p>
        </div>

        <div className="form-row">
          <div className="message-form-group">
            <label>Client</label>

            <select
              value={client}
              onChange={(event) => {
                setClient(event.target.value);
                setClinic("");
              }}
            >
              <option value="">Select Client</option>

              {clients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="message-form-group">
            <label>Clinic</label>

            <select
              value={clinic}
              onChange={(event) => setClinic(event.target.value)}
            >
              <option value="">Select Clinic</option>

              {filteredClinics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="message-form-group">
            <label>Notification Event</label>

            <select
              value={notificationEvent}
              onChange={(event) =>
                setNotificationEvent(event.target.value)
              }
            >
              <option value="">Select Notification Event</option>

              {notificationEvents.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="message-form-group">
            <label>Recipient</label>

            <input
              type="text"
              placeholder="Enter phone number"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
        </div>

        <div className="message-form-group">
          <label>Message</label>

          <textarea
            placeholder="Enter your message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <div className="channel-info">
          <p>
            Communication channels will be selected based on the saved
            notification settings for the selected client and clinic.
          </p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="message-actions">
          <button className="clear-button" onClick={handleClear}>
            Clear
          </button>

          <button
            className="send-button"
            onClick={handleSendMessage}
          >
            Send Message
          </button>
        </div>
      </section>
    </div>
  );
}

export default SendMessage;