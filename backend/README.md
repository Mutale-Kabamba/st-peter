# St. Peter Youth Register Backend

This backend management system provides CRUD operations, authentication, and statistics for the youth register. It uses Node.js, Express, and SQLite. The admin dashboard is available at `/public/index.html`.

## Setup
1. Run `npm install` in the backend folder.
2. Start the server with `npm start`.
3. Access the dashboard at [http://localhost:4000](http://localhost:4000).

## API Endpoints
- `POST /api/login` — Login (username/password)
- `GET /api/youth` — List all youth
- `POST /api/youth` — Add youth
- `PUT /api/youth/:id` — Update youth
- `DELETE /api/youth/:id` — Delete youth
- `GET /api/youth/stats` — Get statistics

## Database
- SQLite file: `backend/youth.db`
- Tables: `youth_register`, `users`

## Default Admin User
Add a user manually to the `users` table for first login:

```
INSERT INTO users (username, password) VALUES ('admin', 'admin123');
```

## Customization
- Update the JWT secret in `server.js` for production.
- Extend dashboard UI as needed.
