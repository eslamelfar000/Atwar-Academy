# Atwar Academy - Vercel Deployment

This project is deployed on Vercel with custom routing configuration.

## Routing Configuration

The `vercel.json` file handles routing for this multi-page HTML application:

- Root path (`/`) redirects to `index.html` which then redirects to `/pages/homepage.html`
- Specific routes like `/support-ticket` redirect to `/pages/support-ticket.html`
- Fallback route (`/(.*)`) catches any other path and serves `/pages/{path}.html`

## File Structure

```
├── index.html                 # Root redirect file
├── vercel.json               # Vercel routing configuration
├── pages/                    # All HTML pages
│   ├── homepage.html
│   ├── support-ticket.html
│   ├── login.html
│   └── ...
├── css/                      # Stylesheets
├── icons/                    # Font Awesome icons
├── images/                   # Image assets
└── js/                       # JavaScript files
```

## Deployment

1. Push changes to your Git repository
2. Vercel will automatically deploy the changes
3. The routing configuration ensures all pages are accessible

## Accessing Pages

- Homepage: `/` or `/homepage`
- Support Ticket: `/support-ticket`
- Login: `/login`
- Register: `/register`
- And all other pages as defined in `vercel.json`

## Troubleshooting

If you encounter 404 errors:
1. Check that the page is listed in `vercel.json` rewrites
2. Verify the HTML file exists in the `pages/` directory
3. Ensure all asset paths use relative paths (`../css/main.css`)
