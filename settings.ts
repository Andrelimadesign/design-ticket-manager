import { App, PluginSettingTab, Setting, Notice, Modal, TextAreaComponent, ButtonComponent } from 'obsidian';
import DesignTicketPlugin from './main';

export interface Settings {
	gitlabUrl: string;
	gitlabToken: string;
	defaultProjectId: string;
	defaultAssignee: string;
	defaultLabels: string;
	defaultPriority: string;
	storyPointLabels: string[];
	categoryLabels: string[];
	priorityLabels: string[];
	customTemplates: Array<{
		name: string;
		content: string;
		category: string;
	}>;
}

export const DEFAULT_SETTINGS: Settings = {
	gitlabUrl: 'https://gitlab.com',
	gitlabToken: '',
	defaultProjectId: '',
	defaultAssignee: 'Andre Lima',
	defaultLabels: 'design',
	defaultPriority: 'medium',
	storyPointLabels: ['1 Story Point', '3 Story Points', '5 Story Points', '8 Story Points', '13 Story Points', '21 Story Points'],
	categoryLabels: ['UI', 'UX', 'Component', 'design-system', 'new-feature', 'improvement', 'bug-fix', 'blocked', 'in-progress', 'review', 'ready-dev'],
	priorityLabels: ['low', 'medium', 'high', 'urgent'],
	customTemplates: []
}

export class DesignTicketSettingTab extends PluginSettingTab {
	plugin: DesignTicketPlugin;

	constructor(app: App, plugin: DesignTicketPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Enhanced Design Ticket Manager Settings'});

		// GitLab Configuration Section
		containerEl.createEl('h3', {text: 'GitLab Configuration'});

		new Setting(containerEl)
			.setName('GitLab URL')
			.setDesc('Your GitLab instance URL (e.g., https://gitlab.com)')
			.addText(text => text
				.setPlaceholder('https://gitlab.com')
				.setValue(this.plugin.settings.gitlabUrl)
				.onChange(async (value: string) => {
					this.plugin.settings.gitlabUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('GitLab Token')
			.setDesc('Your GitLab personal access token with API scope')
			.addText(text => text
				.setPlaceholder('Enter your GitLab token')
				.setValue(this.plugin.settings.gitlabToken)
				.onChange(async (value: string) => {
					this.plugin.settings.gitlabToken = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Project ID')
			.setDesc('Default GitLab project ID (can be overridden in note frontmatter)')
			.addText(text => text
				.setPlaceholder('Enter project ID')
				.setValue(this.plugin.settings.defaultProjectId)
				.onChange(async (value: string) => {
					this.plugin.settings.defaultProjectId = value;
					await this.plugin.saveSettings();
				}));

		// Default Values Section
		containerEl.createEl('h3', {text: 'Default Values'});

		new Setting(containerEl)
			.setName('Default Assignee')
			.setDesc('Default assignee for new tickets (GitLab username)')
			.addText(text => text
				.setPlaceholder('Enter default assignee')
				.setValue(this.plugin.settings.defaultAssignee)
				.onChange(async (value: string) => {
					this.plugin.settings.defaultAssignee = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Labels')
			.setDesc('Default labels for new tickets (comma-separated)')
			.addText(text => text
				.setPlaceholder('design,ui,ux')
				.setValue(this.plugin.settings.defaultLabels)
				.onChange(async (value: string) => {
					this.plugin.settings.defaultLabels = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Priority')
			.setDesc('Default priority for new tickets')
			.addDropdown(dropdown => dropdown
				.addOption('low', 'Low')
				.addOption('medium', 'Medium')
				.addOption('high', 'High')
				.addOption('urgent', 'Urgent')
				.setValue(this.plugin.settings.defaultPriority)
				.onChange(async (value: string) => {
					this.plugin.settings.defaultPriority = value;
					await this.plugin.saveSettings();
				}));

		// Story Point Labels Section
		containerEl.createEl('h3', {text: 'Story Point Labels'});

		new Setting(containerEl)
			.setName('Story Point Labels')
			.setDesc('Available story point labels for tickets')
			.addButton(button => button
				.setButtonText('Manage Labels')
				.onClick(() => {
					this.showStoryPointLabelsManager();
				}));

		// Category Labels Section
		containerEl.createEl('h3', {text: 'Category Labels'});

		new Setting(containerEl)
			.setName('Category Labels')
			.setDesc('Available category labels (UI, UX, etc.)')
			.addButton(button => button
				.setButtonText('Manage Labels')
				.onClick(() => {
					this.showCategoryLabelsManager();
				}));

		// Priority Labels Section
		containerEl.createEl('h3', {text: 'Priority Labels'});

		new Setting(containerEl)
			.setName('Priority Labels')
			.setDesc('Available priority options (low, medium, high, urgent)')
			.addButton(button => button
				.setButtonText('Manage Labels')
				.onClick(() => {
					this.showPriorityLabelsManager();
				}));

		// Template Management Section
		containerEl.createEl('h3', {text: 'Template Management'});

		new Setting(containerEl)
			.setName('Template Commands')
			.setDesc('Use these commands to work with templates:')
			.addButton(button => button
				.setButtonText('Show Commands')
				.onClick(() => {
					new Notice('📝 Commands: "New Design Ticket", "Insert Design Template", "Manage Templates"');
				}));

		// Test Connection Section
		containerEl.createEl('h3', {text: 'Connection Test'});

		new Setting(containerEl)
			.setName('Test Connection')
			.setDesc('Test your GitLab connection and settings')
			.addButton(button => button
				.setButtonText('Test')
				.onClick(async () => {
					await this.testConnection();
				}));

		// Quick Actions Section
		containerEl.createEl('h3', {text: 'Quick Actions'});

		new Setting(containerEl)
			.setName('Create Test Template')
			.setDesc('Create a sample design ticket to test the plugin')
			.addButton(button => button
				.setButtonText('Create Test')
				.onClick(async () => {
					await this.createTestTemplate();
				}));
	}

	async testConnection(): Promise<void> {
		const { gitlabUrl, gitlabToken, defaultProjectId } = this.plugin.settings;
		
		if (!gitlabToken) {
			new Notice('❌ Please enter a GitLab token first');
			return;
		}

		if (!defaultProjectId) {
			new Notice('❌ Please enter a default project ID first');
			return;
		}

		try {
			const response = await fetch(`${gitlabUrl}/api/v4/projects/${defaultProjectId}`, {
				headers: {
					'Authorization': `Bearer ${gitlabToken}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				new Notice('✅ GitLab connection successful!');
			} else {
				const errorData = await response.json();
				new Notice(`❌ GitLab connection failed: ${errorData.message || response.statusText}`);
			}
		} catch (error: any) {
			new Notice(`❌ Connection error: ${error.message}`);
		}
	}

	async createTestTemplate(): Promise<void> {
		try {
			// This will create a test template using the plugin's method
			// We'll need to access the plugin instance to call this
			new Notice('📝 Use the "New Design Ticket" command or ribbon button to create templates!');
		} catch (error: any) {
			new Notice(`❌ Error: ${error.message}`);
		}
	}

	showStoryPointLabelsManager(): void {
		const modal = new StoryPointLabelsModal(this.app, this.plugin);
		modal.open();
	}

	showCategoryLabelsManager(): void {
		const modal = new CategoryLabelsModal(this.app, this.plugin);
		modal.open();
	}

	showPriorityLabelsManager(): void {
		const modal = new PriorityLabelsModal(this.app, this.plugin);
		modal.open();
	}
}

// Story Point Labels Modal
class StoryPointLabelsModal extends Modal {
	plugin: DesignTicketPlugin;

	constructor(app: App, plugin: DesignTicketPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Manage Story Point Labels' });

		const textarea = new TextAreaComponent(contentEl)
			.setPlaceholder('Enter story point labels, one per line')
			.setValue(this.plugin.settings.storyPointLabels.join('\n'))
			.onChange(async (value) => {
				this.plugin.settings.storyPointLabels = value.split('\n').filter(line => line.trim());
				await this.plugin.saveSettings();
			});

		textarea.inputEl.style.width = '100%';
		textarea.inputEl.style.height = '200px';

		contentEl.createEl('p', { text: 'Enter one story point label per line (e.g., "1 Story Point", "2 Story Points")' });

		new ButtonComponent(contentEl)
			.setButtonText('Save & Close')
			.onClick(() => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// Category Labels Modal
class CategoryLabelsModal extends Modal {
	plugin: DesignTicketPlugin;

	constructor(app: App, plugin: DesignTicketPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Manage Category Labels' });

		const textarea = new TextAreaComponent(contentEl)
			.setPlaceholder('Enter category labels, one per line')
			.setValue(this.plugin.settings.categoryLabels.join('\n'))
			.onChange(async (value) => {
				this.plugin.settings.categoryLabels = value.split('\n').filter(line => line.trim());
				await this.plugin.saveSettings();
			});

		textarea.inputEl.style.width = '100%';
		textarea.inputEl.style.height = '200px';

		contentEl.createEl('p', { text: 'Enter one category label per line (e.g., "UI", "UX", "Web Experience")' });

		new ButtonComponent(contentEl)
			.setButtonText('Save & Close')
			.onClick(() => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// Priority Labels Modal
class PriorityLabelsModal extends Modal {
	plugin: DesignTicketPlugin;

	constructor(app: App, plugin: DesignTicketPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Manage Priority Labels' });

		const textarea = new TextAreaComponent(contentEl)
			.setPlaceholder('Enter priority labels, one per line')
			.setValue(this.plugin.settings.priorityLabels.join('\n'))
			.onChange(async (value) => {
				this.plugin.settings.priorityLabels = value.split('\n').filter(line => line.trim());
				await this.plugin.saveSettings();
			});

		textarea.inputEl.style.width = '100%';
		textarea.inputEl.style.height = '200px';

		contentEl.createEl('p', { text: 'Enter one priority label per line (e.g., "low", "medium", "high", "urgent")' });

		new ButtonComponent(contentEl)
			.setButtonText('Save & Close')
			.onClick(() => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
