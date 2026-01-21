export enum NotificationType {
    // static types
    ALL = 'All',
    UNREAD = 'Unread',

    // database types
    EVENTS = "Events",
    NETWORK = 'Network',
    MY_EVENTS = 'MyEvents',
    INVITATION = 'Invitation',
    RSVP_REQUEST = 'RsvpRequest',
}

export enum RSVPRequestStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}