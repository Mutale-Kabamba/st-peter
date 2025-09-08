# Admin Dashboard Setup

The St. Peter Parish website now includes a protected admin dashboard for managing content and bulletins.

## Features

- **Protected Access**: HTTP Basic Authentication secures all admin routes
- **Dataset Management**: Edit JSON data files through a web interface
- **Bulletin Management**: Upload, view, and delete PDF bulletins
- **Responsive Design**: Works on desktop and mobile devices

## Access

Navigate to `/admin` on your deployed site. You'll be prompted for credentials.

**Default Credentials:**
- Username: `admin` 
- Password: `parish2024`

⚠️ **Important**: Change these credentials before deploying to production!

## Configuration

### Environment Variables

For production deployment, set these environment variables:

```bash
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Access admin at: `http://localhost:3000/admin`

## Available Datasets

The admin interface provides editing access to these JSON files:

- `parish-announcements.json` - Parish announcements
- `parish-events.json` - Upcoming parish events  
- `ministries.json` - Ministry information
- `clergy.json` - Clergy member details
- `youth-events.json` - Youth group events
- `youth-announcements.json` - Youth announcements
- `youth-team.json` - Youth team members
- `youth-register.json` - Youth registration data
- And more...

## API Endpoints

### Authentication
All admin endpoints require HTTP Basic Authentication.

### Dataset Management
- `GET /admin/api/datasets` - List all available datasets
- `GET /admin/api/data/:dataset` - Get specific dataset content
- `PUT /admin/api/data/:dataset` - Update dataset content

### Bulletin Management
- `GET /admin/api/bulletins` - List all bulletins
- `POST /admin/api/bulletins` - Upload new bulletin (multipart/form-data)
- `DELETE /admin/api/bulletins/:filename` - Delete bulletin

## Security Notes

1. **Change Default Credentials**: The default admin credentials should be changed before production use
2. **HTTPS Recommended**: Use HTTPS in production to protect credentials in transit
3. **Access Control**: Consider additional IP-based restrictions if needed
4. **Backup Data**: Always backup your JSON files before making changes

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify credentials are correct
- Check if server is running on the expected port
- Ensure `/admin` route is accessible (not blocked by firewall/proxy)

### File Upload Issues
- Ensure the `assets/bulletins/` directory exists and is writable
- Check file size limits (default multer settings apply)
- Verify PDF file format

### JSON Editing Problems
- Validate JSON syntax before saving
- Check file permissions on the `data/` directory
- Ensure proper backup exists before making changes

## Public Site Impact

The admin functionality is completely separate from the public site:
- All existing routes remain unchanged
- No impact on public site performance
- Static file serving continues normally
- Public users cannot access admin features