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

		// Add commands
		this.addCommand({
			id: 'new-design-ticket',
			name: 'New Design Ticket',
			callback: () => this.createNewDesignTicket()
		});

		this.addCommand({
			id: 'insert-design-template',
			name: 'Insert Design Template',
			editorCallback: (editor: Editor) => this.insertDesignTemplate(editor)
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

	insertDesignTemplate(editor: Editor) {
		const template = this.getDesignTemplate();
		editor.replaceSelection(template);
		new Notice('✅ Design template inserted!');
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
---

# 🎨 [Design Task Title]

## 📋 Quick Info
**Timeline:** ${today} → ${dueDate} | **Story points:** ${storyPointOptions}  
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
*Created: ${today} | Updated: ${today}*`;
	}

	async createGitLabTicket() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('❌ Please open a design ticket note first');
			return;
		}

		const file = activeView.file;
		if (!file) {
			new Notice('❌ No active file found');
			return;
		}

		try {
			// Parse the note content to extract metadata
			const content = await this.app.vault.read(file);
			const metadata = this.parseNoteMetadata(content);
			
			// Create GitLab ticket with extracted metadata
			await this.createGitLabTicketFromMetadata(metadata, content);
			
		} catch (error) {
			new Notice('❌ Error creating GitLab ticket: ' + error.message);
		}
	}

	parseNoteMetadata(content: string): any {
		const metadata: any = {
			title: '',
			assignee: '',
			labels: [],
			storyPoints: 0,
			priority: 'medium',
			projectId: this.settings.defaultProjectId
		};

		// Extract title from first heading
		const titleMatch = content.match(/^# 🎨 (.+)$/m);
		if (titleMatch) {
			metadata.title = titleMatch[1].replace(/[\[\]]/g, ''); // Remove brackets
		}

		// Extract assignee from frontmatter or content
		const assigneeMatch = content.match(/assignee:\s*"([^"]+)"/);
		if (assigneeMatch) {
			metadata.assignee = assigneeMatch[1];
		}

		// Extract labels from frontmatter or content
		const labelsMatch = content.match(/labels:\s*"([^"]+)"/);
		if (labelsMatch) {
			metadata.labels = labelsMatch[1].split(',').map((label: string) => label.trim());
		}

		// Extract story points from content (multiple formats)
		const storyPointsMatch = content.match(/\*\*Story points:\*\*\s*\[(\d+)\s*pts\]/);
		if (storyPointsMatch) {
			metadata.storyPoints = parseInt(storyPointsMatch[1]);
		} else {
			// Try to match from the new story point label format
			const storyPointLabelMatch = content.match(/\*\*Story points:\*\*\s*\[([^\]]+)\]/);
			if (storyPointLabelMatch) {
				const storyPointText = storyPointLabelMatch[1];
				const numberMatch = storyPointText.match(/(\d+)/);
				if (numberMatch) {
					metadata.storyPoints = parseInt(numberMatch[1]);
				}
			}
		}

		// Extract priority from frontmatter or content
		const priorityMatch = content.match(/priority:\s*"([^"]+)"/);
		if (priorityMatch) {
			metadata.priority = priorityMatch[1];
		}

		// Extract project ID from frontmatter
		const projectMatch = content.match(/gitlab-project-id:\s*"([^"]+)"/);
		if (projectMatch) {
			metadata.projectId = projectMatch[1];
		}

		return metadata;
	}

	async createGitLabTicketFromMetadata(metadata: any, content: string) {
		if (!this.settings.gitlabToken) {
			new Notice('❌ Please configure GitLab token in settings');
			return;
		}

		if (!metadata.projectId) {
			new Notice('❌ Please set gitlab-project-id in note frontmatter or settings');
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

			const response = await fetch(`${this.settings.gitlabUrl}/api/v4/projects/${metadata.projectId}/issues`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.settings.gitlabToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(issueData)
			});

			if (response.ok) {
				const issue = await response.json();
				new Notice('✅ GitLab ticket created successfully!');
				
				// Open the ticket in browser
				const ticketUrl = `${this.settings.gitlabUrl}/${issue.web_url}`;
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
			const response = await fetch(`${this.settings.gitlabUrl}/api/v4/users?username=${encodeURIComponent(username)}`, {
				headers: {
					'Authorization': `Bearer ${this.settings.gitlabToken}`,
					'Content-Type': 'application/json'
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
}
