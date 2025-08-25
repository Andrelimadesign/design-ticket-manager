import { App, Plugin, TFile, Notice, MarkdownView, Editor } from 'obsidian';
import { DesignTicketSettingTab, Settings, DEFAULT_SETTINGS } from './settings';

export default class DesignTicketPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		// Add setting tab
		this.addSettingTab(new DesignTicketSettingTab(this.app, this));

		// Add ribbon icons
		this.addRibbonIcon('plus-with-circle', 'Create Design Ticket', () => {
			this.createNewDesignTicket();
		});

		this.addRibbonIcon('ticket', 'Create GitLab Ticket', () => {
			this.createGitLabTicket();
		});

		this.addRibbonIcon('star', 'Insert Enhanced Template', () => {
			this.insertEnhancedTemplateToActiveNote();
		});

		this.addRibbonIcon('plus', 'Create Enhanced Design Ticket', () => {
			this.createNewEnhancedDesignTicket();
		});

		// Add commands
		this.addCommand({
			id: 'new-design-ticket',
			name: 'New Design Ticket',
			callback: () => this.createNewDesignTicket()
		});

		this.addCommand({
			id: 'new-enhanced-design-ticket',
			name: 'New Enhanced Design Ticket',
			callback: () => this.createNewEnhancedDesignTicket()
		});

		this.addCommand({
			id: 'insert-design-template',
			name: 'Insert Design Template',
			editorCallback: (editor: Editor) => this.insertDesignTemplate(editor)
		});

		this.addCommand({
			id: 'insert-enhanced-design-template',
			name: 'Insert Enhanced Design Template',
			editorCallback: (editor: Editor) => this.insertEnhancedDesignTemplate(editor)
		});

		this.addCommand({
			id: 'create-gitlab-ticket',
			name: 'Create GitLab Ticket',
			callback: () => this.createGitLabTicket()
		});

		this.addCommand({
			id: 'manage-templates',
			name: 'Manage Templates',
			callback: () => this.manageTemplates()
		});
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createNewDesignTicket() {
		const template = this.getDesignTemplate();
		const fileName = `Design Ticket ${new Date().toISOString().split('T')[0]}`;
		
		try {
			const file = await this.app.vault.create(`${fileName}.md`, template);
			await this.app.workspace.openLinkText(file.path, '', true);
			new Notice('✅ Design ticket template created!');
		} catch (error) {
			new Notice('❌ Error creating template: ' + error.message);
		}
	}

	async createNewEnhancedDesignTicket() {
		const template = this.getEnhancedDesignTemplate();
		const fileName = `Enhanced Design Ticket ${new Date().toISOString().split('T')[0]}`;
		
		try {
			const file = await this.app.vault.create(`${fileName}.md`, template);
			await this.app.workspace.openLinkText(file.path, '', true);
			new Notice('✅ Enhanced design ticket template created!');
		} catch (error) {
			new Notice('❌ Error creating template: ' + error.message);
		}
	}

	insertDesignTemplate(editor: Editor) {
		const template = this.getDesignTemplate();
		editor.replaceSelection(template);
		new Notice('✅ Design template inserted!');
	}

	insertEnhancedDesignTemplate(editor: Editor) {
		const template = this.getEnhancedDesignTemplate();
		editor.replaceSelection(template);
		new Notice('✅ Enhanced design template inserted!');
	}

	async insertEnhancedTemplateToActiveNote() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('❌ Please open a note first');
			return;
		}

		const editor = activeView.editor;
		const template = this.getEnhancedDesignTemplate();
		editor.replaceSelection(template);
		new Notice('✅ Enhanced design template inserted!');
	}

	getDesignTemplate(): string {
		const today = new Date().toISOString().split('T')[0];
		const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		
		// Get available story point labels
		const storyPointOptions = this.settings.storyPointLabels.map(label => `[${label}]`).join(' ');
		
		// Get available category labels as options
		const categoryOptions = this.settings.categoryLabels.map(label => `[${label}]`).join(' ');
		
		// Get available priority labels as options
		const priorityOptions = this.settings.priorityLabels.map(label => `[${label}]`).join(' ');
		
		return `---
gitlab-project-id: "${this.settings.defaultProjectId}"
assignee: "${this.settings.defaultAssignee}"
labels: "${categoryOptions}"
priority: "${priorityOptions}"
due-date: "${dueDate}"
story-points: 
---

# 🎨 [Design Task Title]

## 📋 Quick Info
**Timeline:** ${today} → ${dueDate} | **Story points:** ${storyPointOptions}  
**Figma:** [Paste Figma handoff link here]  
**Status:** Draft  
**Priority:** ${priorityOptions}
**Labels:** ${categoryOptions}

---

## 🎯 Problem / Opportunity
*What are we solving and why does it matter?*

[Brief description of the user problem or business opportunity - 1-2 sentences max]

## 💡 Proposed Solution
*What are we building?*

[Clear description of the design solution - what will users see/experience?]

## 🔧 Technical Specifications
### Frontend Requirements
- **Components needed:** [List new/modified components]
- **Motion/Animations:** [Describe transitions, microinteractions, timing]
- **Breakpoints:** Mobile, Desktop

### Design System Impact
- [ ] Uses existing components only
- [ ] Requires new components (list below)
- [ ] Updates existing patterns
- [ ] Creates new patterns

*New components needed:*
- Component 1: [brief description]
- Component 2: [brief description]

## 🔗 Dependencies
### Blocked by:
- [ ] [Dependency 1 - what's needed first]
- [ ] [Dependency 2 - what's needed first]

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
**Brand Guidelines:** [Link if relevant]

## 💬 Notes & Context
*Anything else the team should know?*

[Optional: Additional context, constraints, or considerations]

---

## 🎛️ Template Options
### Story Points Options:
- \`1 Story Point\` - Very small task, minimal effort
- \`3 Story Points\` - Small task, clear requirements
- \`5 Story Points\` - Medium task, some complexity
- \`8 Story Points\` - Complex task, multiple components
- \`13 Story Points\` - Large task, significant effort
- \`21 Story Points\` - Epic task, needs breakdown

### Priority Options:
- \`low\` - Nice to have, no rush
- \`medium\` - Standard priority
- \`high\` - Important, affects timeline
- \`urgent\` - Critical, blocks other work

### Label Options:
**Design Type:**
- \`UI\` - User interface design
- \`UX\` - User experience design
- \`Component\` - Design system component work

**Component Type:**
- \`design-system\` - Design system work
- \`new-feature\` - New functionality
- \`improvement\` - Enhancement to existing
- \`bug-fix\` - Fixing design issues

**Status:**
- \`blocked\` - Cannot proceed
- \`in-progress\` - Currently working
- \`review\` - Ready for feedback
- \`ready-dev\` - Ready for development

### Assignee Quick Reference:
- \`${this.settings.defaultAssignee}\` - Design Lead

		---
*Created: ${today} | Updated: ${today}*`;
	}

	getEnhancedDesignTemplate(): string {
		const today = new Date().toISOString().split('T')[0];
		const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		
		// Get available story point labels
		const storyPointOptions = this.settings.storyPointLabels.map(label => `[${label}]`).join(' ');
		
		// Get available category labels as options
		const categoryOptions = this.settings.categoryLabels.map(label => `[${label}]`).join(' ');
		
		// Get available priority labels as options
		const priorityOptions = this.settings.priorityLabels.map(label => `[${label}]`).join(' ');
		
		return `---
gitlab-project-id: "${this.settings.defaultProjectId}"
assignee: "${this.settings.defaultAssignee}"
labels: "${categoryOptions}"
priority: "${priorityOptions}"
due-date: "${dueDate}"
story-points: 
---

# 🎨 [Design Task Title]

## 📋 Quick Info
**Timeline:** ${today} → ${dueDate} | **Story points:** ${storyPointOptions}  
**Figma:** [Paste Figma handoff link here]  
**Status:** Draft  
**Priority:** ${priorityOptions}
**Labels:** ${categoryOptions}

---

## 🎯 Problem / Opportunity
*What are we solving and why does it matter?*

[Brief description of the user problem or business opportunity - 1-2 sentences max]

## 💡 Proposed Solution
*What are we building?*

[Clear description of the design solution - what will users see/experience?]

## 🔧 Technical Specifications
### Frontend Requirements
- **Components needed:** [List new/modified components]
- **Motion/Animations:** [Describe transitions, microinteractions, timing]
- **Breakpoints:** Mobile, Desktop

### Design System Impact
- [ ] Uses existing components only
- [ ] Requires new components (list below)
- [ ] Updates existing patterns
- [ ] Creates new patterns

*New components needed:*
- Component 1: [brief description]
- Component 2: [brief description]

## 🔗 Dependencies
### Blocked by:
- [ ] [Dependency 1 - what's needed first]
- [ ] [Dependency 2 - what's needed first]

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
**Brand Guidelines:** [Link if relevant]

## 💬 Notes & Context
*Anything else the team should know?*

[Optional: Additional context, constraints, or considerations]

---

## 🎛️ Template Options
### Story Points Options:
- \`1 Story Point\` - Very small task, minimal effort
- \`3 Story Points\` - Small task, clear requirements
- \`5 Story Points\` - Medium task, some complexity
- \`8 Story Points\` - Complex task, multiple components
- \`13 Story Points\` - Large task, significant effort
- \`21 Story Points\` - Epic task, needs breakdown

### Priority Options:
- \`low\` - Nice to have, no rush
- \`medium\` - Standard priority
- \`high\` - Important, affects timeline
- \`urgent\` - Critical, blocks other work

### Label Options:
**Design Type:**
- \`UI\` - User interface design
- \`UX\` - User experience design
- \`Component\` - Design system component work

**Component Type:**
- \`design-system\` - Design system work
- \`new-feature\` - New functionality
- \`improvement\` - Enhancement to existing
- \`bug-fix\` - Fixing design issues

**Status:**
- \`blocked\` - Cannot proceed
- \`in-progress\` - Currently working
- \`review\` - Ready for feedback
- \`ready-dev\` - Ready for development

### Assignee Quick Reference:
- \`${this.settings.defaultAssignee}\` - Design Lead

---
*Created: ${today} | Updated: ${today}*`;
	}

	async createGitLabTicket() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('❌ Please open a note first');
			return;
		}

		const file = activeView.file;
		if (!file) {
			new Notice('❌ No file found');
			return;
		}
		const content = await this.app.vault.read(file);
		
		// Parse frontmatter and content
		const metadata = this.parseFrontmatter(content);
		
		if (!metadata.projectId) {
			new Notice('❌ No GitLab project ID found in note frontmatter');
			return;
		}

		try {
			// Get GitLab user ID for assignee
			let assigneeId = null;
			if (metadata.assignee) {
				assigneeId = await this.getGitLabUserId(metadata.assignee);
			}

			// Prepare labels (combine default labels with note labels)
			const defaultLabels = this.settings.defaultLabels.split(',').map(l => l.trim());
			const allLabels = Array.from(new Set([...metadata.labels, ...defaultLabels]));
			
			// Add story points as a label if present
			if (metadata.storyPoints > 0) {
				allLabels.push(`${metadata.storyPoints} Story Points`);
			}

			// Add priority as a label
			allLabels.push(`Priority: ${metadata.priority}`);

			// Create GitLab issue
			const issueData = {
				title: metadata.title || 'Design Task',
				description: this.convertMarkdownToGitLab(content),
				assignee_id: assigneeId,
				labels: allLabels.join(','),
				weight: metadata.storyPoints || null
			};

			// Sanitize inputs to prevent encoding issues
			const cleanToken = this.settings.gitlabToken.trim();
			const cleanUrl = this.settings.gitlabUrl.trim();
			const cleanProjectId = metadata.projectId.toString().trim();

			const response = await fetch(`${cleanUrl}/api/v4/projects/${cleanProjectId}/issues`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${cleanToken}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify(issueData)
			});

			if (response.ok) {
				const issue = await response.json();
				new Notice('✅ GitLab ticket created successfully!');
				
				// Open the ticket in browser
				const ticketUrl = `${cleanUrl}/${issue.web_url}`;
				window.open(ticketUrl, '_blank');
			} else {
				const errorData = await response.json();
				throw new Error(`GitLab API error: ${errorData.message || response.statusText}`);
			}

		} catch (error: any) {
			new Notice('❌ Error creating GitLab ticket: ' + error.message);
			console.error('GitLab ticket creation error:', error);
		}
	}

	async getGitLabUserId(username: string): Promise<number | null> {
		try {
			// Search for user by username
			// Sanitize inputs to prevent encoding issues
			const cleanToken = this.settings.gitlabToken.trim();
			const cleanUrl = this.settings.gitlabUrl.trim();
			const cleanUsername = username.trim();

			const response = await fetch(`${cleanUrl}/api/v4/users?username=${encodeURIComponent(cleanUsername)}`, {
				headers: {
					'Authorization': `Bearer ${cleanToken}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			});

			if (response.ok) {
				const users = await response.json();
				if (users.length > 0) {
					return users[0].id;
				}
			}
		} catch (error) {
			console.warn('Could not find GitLab user:', username, error);
		}
		return null;
	}

	convertMarkdownToGitLab(markdown: string): string {
		// Convert Obsidian markdown to GitLab-compatible format
		let converted = markdown;
		
		// Remove frontmatter
		converted = converted.replace(/^---[\s\S]*?---\n/, '');
		
		// Convert Obsidian-specific syntax to standard markdown
		converted = converted.replace(/\[([^\]]+)\]\([^)]*\)/g, '[$1]'); // Remove internal links
		
		// Clean up any remaining Obsidian-specific syntax
		converted = converted.replace(/^\s*-\s*\[ \]\s*/gm, '- [ ] '); // Fix task lists
		
		return converted;
	}

	async manageTemplates() {
		new Notice('📝 Template management coming soon! Use commands for now.');
	}

	parseFrontmatter(content: string): any {
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (!frontmatterMatch) {
			return {};
		}

		const frontmatter = frontmatterMatch[1];
		const metadata: any = {};

		// Parse key-value pairs
		const lines = frontmatter.split('\n');
		for (const line of lines) {
			const [key, ...valueParts] = line.split(':');
			if (key && valueParts.length > 0) {
				const value = valueParts.join(':').trim().replace(/"/g, '');
				
				switch (key.trim()) {
					case 'gitlab-project-id':
						metadata.projectId = value;
						break;
					case 'assignee':
						metadata.assignee = value;
						break;
					case 'labels':
						metadata.labels = value.split(',').map(l => l.trim().replace(/[\[\]]/g, ''));
						break;
					case 'priority':
						metadata.priority = value;
						break;
					case 'story-points':
						metadata.storyPoints = parseInt(value) || 0;
						break;
					case 'title':
						metadata.title = value;
						break;
				}
			}
		}

		return metadata;
	}
}
