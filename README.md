# Enhanced Design Ticket Manager - Obsidian Plugin

Convert your Obsidian design notes into GitLab tickets with professional templates and automation!

## ✨ **New Enhanced Features**

### 🎨 **Professional Design Ticket Templates**
- **Built-in comprehensive template** with all sections you need
- **Smart auto-filling** for dates, project info, and defaults
- **Multiple template types** (Design, Simple, Custom)
- **Template insertion commands** for existing notes

### 🚀 **Automation & Smart Features**
- **One-click template creation** with ribbon button
- **Smart defaults** from your settings
- **Date automation** (current date, due dates)
- **Project auto-filling** from configuration
- **Assignee and label suggestions**

### 🎯 **Enhanced GitLab Integration**
- **Automatic assignee assignment** from Obsidian notes
- **Smart label transfer** including story points and priority
- **Story point mapping** to GitLab weight field
- **Due date support** in tickets
- **Priority management** with labels
- **Enhanced error handling** and notifications
- **Connection testing** in settings

## 🎨 **Professional Template Structure**

Your design tickets now include:

```markdown
---
gitlab-project-id: "12345"
assignee: "designer"
labels: "design,ui,ux"
priority: "medium"
due-date: "2024-09-01"
---

# 🎨 [Design Task Title]

## 📋 Quick Info
**Timeline:** 2024-08-24 → 2024-09-01 | **Story points:** [X pts]  
**Figma:** [Paste Figma handoff link here]  
**Status:** Draft  

## 🎯 Problem / Opportunity
*What are we solving and why does it matter?*

## 💡 Proposed Solution
*What are we building?*

## 🔧 Technical Specifications
### Frontend Requirements
- **Components needed:** [List new/modified components]
- **Motion/Animations:** [Describe transitions, microinteractions, timing]
- **Breakpoints:** Mobile, Tablet, Desktop
- **Browser support:** [Specify if different from standard]
- **Accessibility:** [Any specific WCAG requirements]

### Design System Impact
- [ ] Uses existing components only
- [ ] Requires new components (list below)
- [ ] Updates existing patterns
- [ ] Creates new patterns

## 🔗 Dependencies
### Blocked by:
- [ ] [Dependency 1 - what's needed first]

### Blocks:
- [ ] [What this blocks - other tickets waiting]

## ✅ Definition of Done
- [ ] Design matches Figma specs
- [ ] Responsive on all breakpoints
- [ ] Passes accessibility review
- [ ] Works with existing design system
- [ ] Developer handoff completed
- [ ] Stakeholder approval received

## 📎 Resources
**Design System:** [Link to design system]  
**Related Tickets:** [Links to related GitLab issues]  
**User Research:** [Link to research/user feedback if any]  

## 💬 Notes & Context
*Anything else the team should know?*

---
*Created: 2024-08-24 | Updated: 2024-08-24*
```

## 🚀 **How to Use**

### **1. Create New Design Ticket**
- **Click the ribbon icon** (➕ with circle) for instant template
- **Use command**: `Ctrl/Cmd + P` → "New Design Ticket"
- **Result**: New note with full template, ready to fill

### **2. Set Assignee and Labels in Obsidian**
- **Edit the frontmatter** to set assignee: `assignee: "Andre Lima"`
- **Add labels**: `labels: "UI,UX,Design System"`
- **Set story points**: `**Story points:** [21 pts]` in the Quick Info section
- **Set priority**: `priority: "high"` in frontmatter

### **3. Insert Template in Existing Note**
- **Use command**: `Ctrl/Cmd + P` → "Insert Design Template"
- **Result**: Template inserted at cursor position

### **4. Create GitLab Ticket with Auto-Assignment**
- **Click the ticket icon** (🎫) in left sidebar
- **Use command**: `Ctrl/Cmd + P` → "Create GitLab Ticket"
- **Result**: GitLab ticket created with automatic assignee, labels, and story points

## ⚙️ **Enhanced Settings**

### **GitLab Configuration**
- GitLab URL and token
- Default project ID
- Connection testing

### **Smart Defaults**
- Default assignee
- Default labels
- Default priority
- Auto-fill suggestions

### **Template Management**
- Built-in templates
- Custom template support
- Template categories

## 🔧 **Commands Available**

| Command | Description | Shortcut |
|---------|-------------|----------|
| **New Design Ticket** | Creates new note with template | Ribbon button |
| **Insert Design Template** | Inserts template in current note | `Ctrl/Cmd + P` |
| **Create GitLab Ticket** | Creates ticket from current note | `Ctrl/Cmd + P` |
| **Manage Templates** | Opens template manager | `Ctrl/Cmd + P` |

## 📱 **Ribbon Icons**

- **🎫 Ticket Icon**: Create GitLab ticket from current note
- **➕ Circle Icon**: Create new design ticket template

## 🎯 **Perfect For**

- **Design teams** working with developers
- **Product managers** creating detailed specifications
- **UX designers** documenting user flows
- **Design system maintainers** tracking component updates
- **Stakeholders** reviewing design requirements

## 🔄 **Automatic Assignment & Label Transfer**

The enhanced plugin automatically reads your Obsidian notes and transfers key information to GitLab:

### **What Gets Automatically Set:**
- **Assignee**: Maps username from note to GitLab user ID
- **Labels**: Combines note labels with default labels
- **Story Points**: Converts to GitLab weight field
- **Priority**: Added as priority label
- **Project ID**: Uses note frontmatter or default setting

### **Example Workflow:**
1. **Create note** with `assignee: "Andre Lima"` and `labels: "UI,UX"`
2. **Set story points** as `**Story points:** [21 pts]`
3. **Click ticket icon** → Plugin automatically:
   - Finds GitLab user "Andre Lima"
   - Sets assignee to that user
   - Adds labels: "UI", "UX", "21 Story Points", "Priority: high"
   - Sets weight field to 21

## 🚀 **Installation**

1. **Copy files** to `.obsidian/plugins/design-ticket-manager/`:
   - `main.js` (19.1KB - enhanced plugin)
   - `manifest.json` (plugin metadata)

2. **Restart Obsidian**

3. **Enable plugin** in Community plugins

4. **Configure GitLab** settings

5. **Start creating** professional design tickets!

## 🔮 **Future Enhancements**

- **Template library** with multiple categories
- **AI content suggestions** for common sections
- **Bulk ticket creation** from multiple notes
- **Template versioning** and sharing
- **Advanced field mapping** for custom GitLab fields
- **Template analytics** and usage tracking

## 💡 **Pro Tips**

1. **Use smart defaults** in settings to save time
2. **Create custom templates** for your team's specific needs
3. **Use the ribbon buttons** for quick access
4. **Test connections** before creating tickets
5. **Customize labels** for your workflow

## 🆘 **Support & Troubleshooting**

- **Plugin not showing**: Check Community plugins are enabled
- **Template not working**: Verify you're in markdown editor view
- **GitLab errors**: Test connection in settings
- **Missing features**: Check you have the latest version

---

**Transform your Obsidian notes into professional GitLab tickets with this enhanced plugin!** 🎨✨
