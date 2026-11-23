# User flows

## Buyer: from catalog to ticket

```mermaid
flowchart TD
    A[Event catalog] --> B[Event page]
    B --> B2[Choose city and date: session]
    B2 --> S{Sales open?}
    S -- Not yet / closed --> S2[Show sales dates]
    S -- Yes --> C[Seat map with price categories]
    C --> D[Select seats, up to the per-order limit]
    D --> E{Logged in with verified email?}
    E -- No --> F[Register / Login, confirm email] --> G
    E -- Yes --> G[Hold seats]
    G --> H{Seats still available?}
    H -- No --> I[Error: seat taken, map refreshes] --> C
    H -- Yes --> J[Order summary: seats + service fee, 10-minute timer]
    J --> K[Redirect to monobank payment page]
    K --> R{Webhook result}
    R -- Timer expired --> L[Hold released, seats AVAILABLE again] --> C
    R -- Payment failed --> M[Retry payment] --> K
    R -- Paid --> N[Booking CONFIRMED, seats SOLD]
    N --> O[Email with PDF ticket and QR]
    N --> P[My tickets]
    P --> RF{Request refund?}
    RF -- Before deadline --> RF2[Payment cancelled via provider, booking REFUNDED, seats AVAILABLE]
    RF -- Too late --> RF3[Refund not available]
    O --> Q[Controller scans QR at entrance]
    P --> Q
```

## Organizer: from application to check-in

```mermaid
flowchart TD
    A[Registered user] --> AP[Apply as organizer: FOP or company details]
    AP --> AR{Admin approves?}
    AR -- No --> AR2[REJECTED with reason, fix and resubmit] --> AP
    AR -- Yes --> D[Role ORGANIZER. Create event: title, description, poster, refund rules. DRAFT]
    D --> S[Add session]
    S --> B{Venue in platform catalog?}
    B -- Yes --> P[Set date, sales period, ticket limit]
    B -- No --> V1[Create private venue: sections, rows, generated seat map] --> P
    P --> PC[Create price categories and assign them to seats]
    PC --> BL[Block seats: sound desk, cameras, guests]
    BL --> CT[Assign controllers]
    CT --> M{More cities or dates?}
    M -- Yes --> S
    M -- No --> F[Publish event]
    F --> G[Sales open by schedule]
    G --> H[Telegram notifications about sales]
    G --> I[Sales dashboard: revenue and platform fee]
    G --> J{Cancel a session?}
    J -- Yes --> K[Session CANCELLED, all its bookings refunded]
    J -- No --> L[Session day: controllers scan tickets]
```

## Controller: check-in

```mermaid
flowchart TD
    A[Controller logs in] --> B[Opens assigned session]
    B --> C[Scans QR]
    C --> D{Ticket valid for this session?}
    D -- No --> E[Rejected: wrong session or fake code]
    D -- Yes --> F{Already used?}
    F -- Yes --> G[Rejected: shows when and who scanned it]
    F -- No --> H[Marked as used, person enters]
```

## Booking statuses

```mermaid
stateDiagram-v2
    [*] --> PENDING: seats held
    PENDING --> CONFIRMED: payment succeeded
    PENDING --> EXPIRED: 10 minutes passed
    PENDING --> CANCELLED: user cancelled
    CONFIRMED --> REFUNDED: refund before deadline or session cancelled
    EXPIRED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
```

## Seat statuses (per session)

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE
    AVAILABLE --> BLOCKED: organizer blocks
    BLOCKED --> AVAILABLE: organizer releases
    AVAILABLE --> HELD: added to a booking
    HELD --> AVAILABLE: hold expired or cancelled
    HELD --> SOLD: payment succeeded
    SOLD --> AVAILABLE: refund
```

## Organizer application statuses

```mermaid
stateDiagram-v2
    [*] --> PENDING: submitted
    PENDING --> APPROVED: admin approves
    PENDING --> REJECTED: admin rejects with reason
    REJECTED --> PENDING: fixed and resubmitted
    APPROVED --> [*]
```
