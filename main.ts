import { Plugin, Notice, TFile, MarkdownView, Editor, MarkdownView as MarkdownViewType } from 'obsidian';
import { DesignTicketSettingTab, Settings, DEFAULT_SETTINGS } from './settings';

interface TicketData {
	title: string;
	summary: string;
	requirements: string[];
	acceptanceCriteria: string[];
	projectId: string;
	assignee?: string;
	labels?: string;
	priority?: string;
	dueDate?: string;
}

interface TemplateData {
	name: string;
	content: string;
	category: string;
}

export default class DesignTicketPlugin extends Plugin {
	settings: Settings;
	private templates: TemplateData[] = [];

	async onload() {
		console.log('Loading Enhanced Design Ticket Manager plugin');

		await this.loadSettings();
		await this.loadTemplates();

		// Add settings tab
		this.addSettingTab(new DesignTicketSettingTab(this.app, this));

		// Add ribbon icon for creating tickets
		this.addRibbonIcon('ticket', 'Create GitLab Ticket', (evt: MouseEvent) => {
			this.createTicket();
		});

		// Add ribbon icon for new design ticket template
		this.addRibbonIcon('plus-with-circle', 'New Design Ticket Template', (evt: MouseEvent) => {
			this.createNewDesignTicket();
		});

		// Add commands
		this.addCommand({
			id: 'create-gitlab-ticket',
			name: 'Create GitLab Ticket',
			callback: () => {
				this.createTicket();
			}
		});

		this.addCommand({
			id: 'insert-design-template',
			name: 'Insert Design Ticket Template',
			editorCallback: (editor: Editor, view: MarkdownViewType) => {
				this.insertDesignTemplate(editor);
			}
		});

		this.addCommand({
			id: 'new-design-ticket',
			name: 'New Design Ticket Note',
			callback: () => {
				this.createNewDesignTicket();
			}
		});

		this.addCommand({
			id: 'manage-templates',
			name: 'Manage Templates',
			callback: () => {
				this.openTemplateManager();
			}
		});
	}

	onunload() {
		console.log('Unloading Enhanced Design Ticket Manager plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadTemplates() {
		// Load default templates
		this.templates = [
			{
				name: 'Design Ticket',
				category: 'Design',
				content: this.getDefaultDesignTemplate()
			},
			{
				name: 'Simple Ticket',
				category: 'Basic',
				content: this.getSimpleTemplate()
			}
		];

		// Load custom templates from settings
		try {
			const data = await this.loadData();
			const customTemplates = data?.customTemplates || [];
			this.templates.push(...customTemplates);
		} catch (error) {
			console.log('No custom templates found, using defaults only');
		}
	}

	getDefaultDesignTemplate(): string {
		const currentDate = new Date().toISOString().split('T')[0];
		const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		
		return `---
gitlab-project-id: "${this.settings.defaultProjectId || ''}"
assignee: "${this.settings.defaultAssignee || ''}"
labels: "${this.settings.defaultLabels || 'design'}"
priority: "${this.settings.defaultPriority || 'medium'}"
due-date: "${endDate}"
---

# 🎨 [Design Task Title]

## 📋 Quick Info
**Timeline:** ${currentDate} → ${endDate} | **Story points:** [X pts]  
**Figma:** [Paste Figma handoff link here]  
**Status:** Draft  

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
- **Breakpoints:** Mobile, Tablet, Desktop
- **Browser support:** [Specify if different from standard]
- **Accessibility:** [Any specific WCAG requirements]

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
*Created: ${currentDate} | Updated: ${currentDate}*`;
	}

	getSimpleTemplate(): string {
		const currentDate = new Date().toISOString().split('T')[0];
		
		return `---
gitlab-project-id: "${this.settings.defaultProjectId || ''}"
assignee: "${this.settings.defaultAssignee || ''}"
labels: "${this.settings.defaultLabels || 'design'}"
priority: "${this.settings.defaultPriority || 'medium'}"
---

# [Ticket Title]

## Summary
Brief description of the task

## Requirements
- Requirement 1
- Requirement 2

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

---
*Created: ${currentDate}*`;
	}

	async createNewDesignTicket() {
		try {
			const template = this.getDefaultDesignTemplate();
			const fileName = `Design Ticket ${new Date().toISOString().split('T')[0]}`;
			
			// Create new file with template
			const file = await this.app.vault.create(`${fileName}.md`, template);
			
			// Open the new file
			await this.app.workspace.openLinkText(fileName, '', true);
			
			new Notice('✅ New design ticket template created!');
		} catch (error: any) {
			new Notice(`❌ Error creating template: ${error.message}`);
		}
	}

	async insertDesignTemplate(editor: Editor) {
		try {
			const template = this.getDefaultDesignTemplate();
			const cursor = editor.getCursor();
			
			// Insert template at cursor position
			editor.replaceRange(template, cursor);
			
			// Move cursor to title field
			const lines = template.split('\n');
			const titleLineIndex = lines.findIndex(line => line.includes('[Design Task Title]'));
			if (titleLineIndex !== -1) {
				editor.setCursor(cursor.line + titleLineIndex, 7); // Position after "# 🎨 "
			}
			
			new Notice('✅ Design template inserted!');
		} catch (error: any) {
			new Notice(`❌ Error inserting template: ${error.message}`);
		}
	}

	async openTemplateManager() {
		// This would open a modal for managing templates
		// For now, show a notice
		new Notice('📝 Template manager coming soon! Use commands to insert templates.');
	}

	async createTicket(): Promise<void> {
		// Check if we have the required settings
		if (!this.settings.gitlabToken) {
			new Notice('❌ Please configure your GitLab token in settings first');
			return;
		}

		// Get the active file
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			new Notice('❌ Please open a note first');
			return;
		}

		const file = activeView.file;
		if (!file) {
			new Notice('❌ No active file found');
			return;
		}

		try {
			// Parse the note content
			const ticketData = await this.parseNote(file);
			if (!ticketData) {
				return;
			}

			// Create the GitLab ticket
			await this.createGitLabTicket(ticketData);
			
		} catch (error: any) {
			new Notice(`❌ Error creating ticket: ${error.message}`);
		}
	}

	async parseNote(file: TFile): Promise<TicketData | null> {
		try {
			const content = await this.app.vault.read(file);
			const lines = content.split('\n');

			// Parse YAML frontmatter
			const frontmatter = this.parseFrontmatter(lines);
			
			// Parse markdown content
			const parsed = this.parseMarkdownContent(lines);

			// Validate required fields
			if (!parsed.title) {
				new Notice('❌ Note must have a # title');
				return null;
			}

			if (!parsed.summary) {
				new Notice('❌ Note must have a ## Summary section');
				return null;
			}

			// Get project ID from frontmatter or settings
			const projectId = frontmatter['gitlab-project-id'] || this.settings.defaultProjectId;
			if (!projectId) {
				new Notice('❌ No project ID found in note or settings');
				return null;
			}

			return {
				title: parsed.title,
				summary: parsed.summary,
				requirements: parsed.requirements,
				acceptanceCriteria: parsed.acceptanceCriteria,
				projectId: projectId,
				assignee: frontmatter['assignee'],
				labels: frontmatter['labels'],
				priority: frontmatter['priority'],
				dueDate: frontmatter['due-date']
			};

		} catch (error: any) {
			new Notice(`❌ Error parsing note: ${error.message}`);
			return null;
		}
	}

	parseFrontmatter(lines: string[]): Record<string, any> {
		const frontmatter: Record<string, any> = {};
		let inFrontmatter = false;
		let frontmatterLines: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			if (line === '---') {
				if (!inFrontmatter) {
					inFrontmatter = true;
					continue;
				} else {
					break;
				}
			}

			if (inFrontmatter) {
				frontmatterLines.push(line);
			}
		}

		// Parse YAML-like frontmatter (simple key-value parsing)
		for (const line of frontmatterLines) {
			const match = line.match(/^([^:]+):\s*(.+)$/);
			if (match) {
				const key = match[1].trim();
				let value = match[2].trim();
				
				// Remove quotes if present
				if ((value.startsWith('"') && value.endsWith('"')) || 
					(value.startsWith("'") && value.endsWith("'"))) {
					value = value.slice(1, -1);
				}
				
				frontmatter[key] = value;
			}
		}

		return frontmatter;
	}

	parseMarkdownContent(lines: string[]): {
		title: string;
		summary: string;
		requirements: string[];
		acceptanceCriteria: string[];
	} {
		let title = '';
		let summary = '';
		let requirements: string[] = [];
		let acceptanceCriteria: string[] = [];
		
		let inSummary = false;
		let inRequirements = false;
		let inAcceptanceCriteria = false;
		let inFrontmatter = false;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			// Skip frontmatter
			if (line === '---') {
				if (!inFrontmatter) {
					inFrontmatter = true;
					continue;
				} else {
					inFrontmatter = false;
					continue;
				}
			}
			
			if (inFrontmatter) continue;

			// Parse title (first # heading)
			if (line.startsWith('# ') && !title) {
				title = line.substring(2).trim();
				continue;
			}

			// Parse summary section
			if (line.startsWith('## Summary')) {
				inSummary = true;
				inRequirements = false;
				inAcceptanceCriteria = false;
				continue;
			}

			// Parse requirements section
			if (line.startsWith('## Requirements')) {
				inSummary = false;
				inRequirements = true;
				inAcceptanceCriteria = false;
				continue;
			}

			// Parse acceptance criteria section
			if (line.startsWith('## Acceptance Criteria')) {
				inSummary = false;
				inRequirements = false;
				inAcceptanceCriteria = true;
				continue;
			}

			// Stop parsing if we hit another ## heading
			if (line.startsWith('## ') && !line.startsWith('## Summary') && 
				!line.startsWith('## Requirements') && !line.startsWith('## Acceptance Criteria')) {
				inSummary = false;
				inRequirements = false;
				inAcceptanceCriteria = false;
				continue;
			}

			// Collect content based on current section
			if (inSummary && line.trim() && !line.startsWith('#')) {
				summary += line.trim() + ' ';
			}

			if (inRequirements && line.trim().startsWith('- ')) {
				requirements.push(line.trim().substring(2));
			}

			if (inAcceptanceCriteria && line.trim().startsWith('- [ ]')) {
				acceptanceCriteria.push(line.trim().substring(4));
			}
		}

		return {
			title: title.trim(),
			summary: summary.trim(),
			requirements,
			acceptanceCriteria
		};
	}

	async createGitLabTicket(ticketData: TicketData): Promise<void> {
		const { gitlabUrl, gitlabToken } = this.settings;
		const { projectId, title, summary, requirements, acceptanceCriteria, assignee, labels, priority, dueDate } = ticketData;

		// Build description
		let description = `## Summary\n${summary}\n\n`;
		
		if (requirements.length > 0) {
			description += `## Requirements\n`;
			requirements.forEach(req => {
				description += `- ${req}\n`;
			});
			description += '\n';
		}

		if (acceptanceCriteria.length > 0) {
			description += `## Acceptance Criteria\n`;
			acceptanceCriteria.forEach(criteria => {
				description += `- [ ] ${criteria}\n`;
			});
		}

		// Prepare ticket data
		const ticketPayload: any = {
			title: title,
			description: description,
			labels: labels || 'design'
		};

		// Add priority if specified
		if (priority) {
			ticketPayload.labels = `${ticketPayload.labels},priority:${priority}`;
		}

		// Add due date if specified
		if (dueDate) {
			ticketPayload.due_date = dueDate;
		}

		try {
			const response = await fetch(`${gitlabUrl}/api/v4/projects/${projectId}/issues`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${gitlabToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(ticketPayload)
			});

			if (response.ok) {
				const result = await response.json();
				new Notice(`✅ Ticket created successfully! Issue #${result.iid}`);
				
				// Open the ticket in browser
				const ticketUrl = `${gitlabUrl}/${encodeURIComponent(result.project_id)}/-/issues/${result.iid}`;
				window.open(ticketUrl, '_blank');
			} else {
				const errorData = await response.json();
				new Notice(`❌ Failed to create ticket: ${errorData.message || response.statusText}`);
			}
		} catch (error: any) {
			new Notice(`❌ Error creating ticket: ${error.message}`);
		}
	}
}
