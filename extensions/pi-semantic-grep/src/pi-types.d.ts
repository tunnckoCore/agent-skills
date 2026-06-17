declare module "@earendil-works/pi-coding-agent" {
	export interface ExtensionAPI {
		registerTool(tool: any): void;
		registerCommand(name: string, command: any): void;
		on(event: string, handler: any): void;
	}
}

declare module "@earendil-works/pi-tui" {
	export class Text {
		constructor(text: string, x?: number, y?: number);
		setText(text: string): void;
	}
}

declare module "@earendil-works/pi-coding-agent" {
	export function keyHint(keybinding: string, description: string): string;
}
