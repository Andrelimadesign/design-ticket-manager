# Installation Guide

## Quick Install

1. **Download the plugin files**:
   - `main.js` (the built plugin)
   - `manifest.json` (plugin metadata)
   - `styles.css` (if you have custom styles)

2. **Create the plugin folder**:
   - Navigate to your Obsidian vault
   - Go to `.obsidian/plugins/`
   - Create a new folder called `design-ticket-manager`
   - Copy the files into this folder

3. **Enable the plugin**:
   - Restart Obsidian
   - Go to Settings → Community plugins
   - Turn off Safe mode
   - Click "Refresh" 
   - Find "Design Ticket Manager" and enable it

4. **Configure GitLab**:
   - Go to Settings → Community plugins → Design Ticket Manager
   - Enter your GitLab URL, token, and default project ID
   - Test the connection

## File Structure in Obsidian

Your plugin folder should look like this:
```
.obsidian/plugins/design-ticket-manager/
├── main.js
├── manifest.json
└── styles.css (optional)
```

## Testing

1. Create a new note using the template from `sample-ticket.md`
2. Click the ticket icon in the left sidebar
3. You should see a success message and the ticket will open in your browser

## Troubleshooting

- **Plugin not showing**: Make sure you've restarted Obsidian after copying files
- **Settings not saving**: Check that the plugin folder has write permissions
- **GitLab errors**: Verify your token has API access and the project ID is correct

## Development

To modify the plugin:
1. Edit the `.ts` files
2. Run `npm run build` to rebuild
3. Copy the new `main.js` to your plugin folder
4. Restart Obsidian
