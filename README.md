# Traffic Violations

A full-stack traffic violation management system built with React, Vite, Node.js, Express, and MongoDB.

This project helps users search challans, view violation details, manage payments, download PDF reports, and access a personalized dashboard after sign in.

## Features

- Search challans by:
  - Challan number
  - Vehicle number
  - Phone number
- View challan details with:
  - Violation type
  - Fine amount
  - Payment status
  - Location
  - Evidence image
- Secure user authentication
  - Sign up
  - Sign in
  - JWT-based token handling
  - Password hashing using `bcryptjs`
- Personalized dashboard
  - View all challans linked to the signed-in phone number
  - Paid/unpaid challan summary
  - Violation frequency analytics
  - Challan log table
- PDF report generation for challans
- Feature and About pages with custom UI components
- Custom toast notification system

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- jsPDF
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```bash
Traffic-Violations/
│
├── client/                # Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── styles/
│
├── server/                # Backend
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
│
└── .gitignore
