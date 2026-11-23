# Database schema

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : "has"
    USER ||--o{ VERIFICATION_TOKEN : "has"
    USER ||--o| ORGANIZER_PROFILE : "applies with"
    USER ||--o{ VENUE : "owns private"
    USER ||--o{ EVENT : "organizes"
    USER ||--o{ BOOKING : "makes"
    USER ||--o{ SESSION_CONTROLLER : "checks tickets as"

    VENUE ||--|{ VENUE_SEAT : "has layout"
    VENUE ||--o{ SESSION : "hosts"

    EVENT ||--|{ SESSION : "runs as"
    SESSION ||--|{ PRICE_CATEGORY : "has"
    SESSION ||--|{ EVENT_SEAT : "sells"
    SESSION ||--o{ SESSION_CONTROLLER : "staffed by"
    PRICE_CATEGORY ||--o{ EVENT_SEAT : "prices"
    VENUE_SEAT ||--o{ EVENT_SEAT : "is sold as"

    SESSION ||--o{ BOOKING : "has"
    BOOKING ||--|{ BOOKING_ITEM : "contains"
    EVENT_SEAT ||--o{ BOOKING_ITEM : "booked in"
    BOOKING ||--o{ PAYMENT : "paid by"
    BOOKING_ITEM ||--o| TICKET : "issues"

    USER {
        uuid id PK
        string email UK
        datetime emailVerifiedAt "null = not verified"
        string passwordHash
        string name
        enum role "USER | ORGANIZER | ADMIN"
        datetime blockedAt "null = active"
        datetime createdAt
    }

    REFRESH_TOKEN {
        uuid id PK
        uuid userId FK
        string tokenHash UK
        datetime expiresAt
        datetime revokedAt "null = active"
    }

    VERIFICATION_TOKEN {
        uuid id PK
        uuid userId FK
        enum type "EMAIL_VERIFY | PASSWORD_RESET"
        string tokenHash UK
        datetime expiresAt
        datetime usedAt
    }

    ORGANIZER_PROFILE {
        uuid id PK
        uuid userId FK,UK
        string legalName "FOP or company name"
        string taxId "IPN or EDRPOU"
        string phone
        enum status "PENDING | APPROVED | REJECTED"
        string rejectionReason
    }

    VENUE {
        uuid id PK
        uuid ownerId FK "null = platform catalog, else private to organizer"
        string name
        string city
        string address
        jsonb layoutConfig "generator input: sections, rows, numbering, gaps"
        boolean isArchived
    }

    VENUE_SEAT {
        uuid id PK
        uuid venueId FK
        string section
        int row
        int number
        float x "position on the seat map"
        float y
        boolean isActive "false = removed from layout"
    }

    EVENT {
        uuid id PK
        uuid organizerId FK
        string title
        text description
        string posterUrl
        int refundDeadlineHours "null = no refunds"
        enum status "DRAFT | PUBLISHED | HIDDEN | ARCHIVED"
    }

    SESSION {
        uuid id PK
        uuid eventId FK
        uuid venueId FK
        datetime startsAt
        datetime salesStartAt
        datetime salesEndAt
        int maxTicketsPerOrder
        enum status "SCHEDULED | CANCELLED | FINISHED"
    }

    PRICE_CATEGORY {
        uuid id PK
        uuid sessionId FK
        string name "Parterre, Balcony, VIP"
        int priceCents
        string color "for the seat map"
    }

    SESSION_CONTROLLER {
        uuid id PK
        uuid sessionId FK
        uuid userId FK
    }

    EVENT_SEAT {
        uuid id PK
        uuid sessionId FK
        uuid venueSeatId FK
        uuid priceCategoryId FK
        enum status "AVAILABLE | BLOCKED | HELD | SOLD"
        datetime heldUntil "null unless HELD"
        int version "optimistic locking"
    }

    BOOKING {
        uuid id PK
        uuid userId FK
        uuid sessionId FK
        enum status "PENDING | CONFIRMED | EXPIRED | CANCELLED | REFUNDED"
        int subtotalCents "sum of seat prices"
        int serviceFeeCents "platform commission"
        int totalCents
        datetime expiresAt
        string idempotencyKey UK
        datetime createdAt
    }

    BOOKING_ITEM {
        uuid id PK
        uuid bookingId FK
        uuid eventSeatId FK
        int priceCents "price at the moment of booking"
    }

    PAYMENT {
        uuid id PK
        uuid bookingId FK
        string provider "monobank"
        string providerInvoiceId UK
        int amountCents
        string currency "UAH"
        enum status "PENDING | SUCCEEDED | FAILED | REFUNDED"
        jsonb providerPayload "raw provider response and webhooks"
        datetime createdAt
    }

    TICKET {
        uuid id PK
        uuid bookingItemId FK,UK
        string code UK "encoded in QR"
        datetime usedAt "null = not scanned yet"
        uuid scannedById FK "controller"
    }
```

## Key decisions

- **EVENT vs SESSION.** `EVENT` is *what* happens (title, description, poster, refund rules) and is created once. `SESSION` is *where and when* (venue, date, sales period, seats, prices). A tour across 5 cities or a play every Saturday is one event with many sessions. Seats and bookings belong to a session.
- **Price categories.** Organizers price by category ("Parterre — 800 UAH, Balcony — 500 UAH"), not seat by seat. Each `EVENT_SEAT` points to a `PRICE_CATEGORY` of its session.
- **Sales rules on the session**: tickets can be bought only between `salesStartAt` and `salesEndAt`, and no more than `maxTicketsPerOrder` per booking (protection from bots and scalpers).
- **Organizer verification.** Any user can apply to become an organizer with FOP/company details. An admin approves the `ORGANIZER_PROFILE`, and only then the user gets the `ORGANIZER` role.
- **Two kinds of venues.** Platform catalog venues (`ownerId = null`) are created by admins and available to every organizer. If a venue is missing, an organizer creates a private venue (`ownerId = organizer`) that only they can see and use. No venue moderation: organizers are verified instead.
- **Seat layout generator.** A layout is generated from sections and rows (seat count, start number, numbering direction, gaps). Every seat gets `x, y` coordinates, so the frontend draws the map from data, and a visual editor can be added later without changing the model.
- **Blocked seats.** On a specific session the organizer can mark seats as `BLOCKED` (sound desk, cameras, guest seats); they are not sold.
- **VENUE_SEAT vs EVENT_SEAT.** The hall layout is described once (`VENUE_SEAT`). For every session the layout is copied into `EVENT_SEAT`, which holds the price category and the sale status for that session. Later edits to `VENUE_SEAT` affect only new sessions. Seats are deactivated (`isActive = false`), never deleted, and venues with sessions are archived, not deleted.
- **Unique constraint** `(sessionId, venueSeatId)` on `EVENT_SEAT`: one physical seat appears only once per session.
- **BOOKING_ITEM** links a booking to its seats and stores the price at the moment of purchase, so later price changes don't affect old bookings.
- **Temporary hold**: `EVENT_SEAT.status = HELD` + `heldUntil`, `BOOKING.status = PENDING` + `expiresAt`. The payment invoice gets the same validity, and a background job releases expired holds.
- **Platform commission**: `serviceFeeCents` is calculated at booking time and stored, so reports can split organizer revenue and platform income.
- **Payments through a provider interface.** `PAYMENT.provider` is `monobank` now; the code talks to a `PaymentProvider` interface, so another provider (LiqPay, WayForPay) can be added without touching booking logic. A booking can have several payment attempts.
- **Refunds** are allowed until `refundDeadlineHours` before the session starts; a cancelled session refunds all its bookings.
- **Controllers** are users assigned to a specific session (`SESSION_CONTROLLER`). Only they can scan tickets for it; `TICKET.scannedById` records who let the person in.
- **Email verification and password reset** share one token table; only token hashes are stored.
- **Admin controls**: an admin can hide an event (`HIDDEN`) or block a user (`blockedAt`) without deleting data.
- **Rescheduling**: changing a session date keeps tickets valid, notifies buyers and allows a refund regardless of the deadline.
- **JSONB where structure is external or document-like**: `PAYMENT.providerPayload` keeps raw monobank responses for debugging (the bank controls the shape); `VENUE.layoutConfig` keeps the generator input so a layout can be reopened and regenerated.
- **Activity log lives in MongoDB**, not in this schema: append-only events (who did what and when: moderation decisions, price changes, check-ins, booking status changes), each event type with its own fields.
- **Money in kopecks** (`int`) to avoid floating-point errors.
- **Idempotency key** on `BOOKING` prevents duplicate bookings when a client retries the same request.
- Indexes: `SESSION(startsAt)`, `SESSION(eventId)`, `SESSION(venueId)`, `EVENT(status)`, `EVENT_SEAT(sessionId, status)`, `BOOKING(userId)`, `BOOKING(status, expiresAt)`.