import NotificationTabs from "../NotificationTabs";

type NotificationEvent = {
    id: number;
    name: string;
    description: string;
    status: string;
};

function Events() {
    const events: NotificationEvent[] = [
        {
            id: 1,
            name: "Appointment Created",
            description: "Triggered when a new appointment is created.",
            status: "Active",
        },
        {
            id: 2,
            name: "Appointment Cancelled",
            description: "Triggered when an appointment is cancelled.",
            status: "Active",
        },
    ];

    return (
        <div className="page-container">

            <NotificationTabs />

            <div className="page-header">
                <div>
                    <h1>Notification Events</h1>
                    <p>
                        Manage the events that trigger notifications.
                    </p>
                </div>
            </div>

            <section className="content-section">

                <div className="section-header">
                    <div>
                        <h2>Events</h2>
                        <p>
                            Configure notification events used across the
                            system.
                        </p>
                    </div>
                </div>

                <div className="table-card">

                    <div className="events-table-header">
                        <div>Event Name</div>
                        <div>Description</div>
                        <div>Status</div>
                    </div>

                    {events.map((event) => (
                        <div
                            className="events-table-row"
                            key={event.id}
                        >
                            <div className="event-title">
                                {event.name}
                            </div>

                            <div className="event-description">
                                {event.description}
                            </div>

                            <div>
                                <span className="event-status">
                                    {event.status}
                                </span>
                            </div>
                        </div>
                    ))}

                </div>

            </section>

        </div>
    );
}

export default Events;