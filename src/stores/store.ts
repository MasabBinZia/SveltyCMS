import { writable, type Writable } from 'svelte/store';
import { publicEnv } from '@root/config/public';
import type { CollectionNames, Schema } from '@src/collections/types';

// Paraglidejs
import * as m from '@src/paraglide/messages.js';
import { setLanguageTag, type AvailableLanguageTag } from '@src/paraglide/runtime';

// This creates a writable store that can hold a string value or be undefined.
export const device_id = writable<string | undefined>();

//  Categories
export const categories: Writable<
	Array<{
		name: string;
		icon: string;
		collections: Array<Schema>;
	}>
> = writable();
export const collections = writable({}) as Writable<{ [key in CollectionNames]: Schema }>;
export const unAssigned: Writable<Array<Schema>> = writable();
export const collection: Writable<Schema> = writable();
export const targetWidget: Writable<any> = writable({});

//  Collections
// collective data of collection
export const collectionValue: any = writable({});
// entry data of collection
export const entryData: Writable<any> = writable({});
// collective crud
export const mode: Writable<'view' | 'edit' | 'create' | 'delete' | 'modify' | 'media'> = writable('view');
// collective status
export const statusMap = {
	delete: 'deleted',
	publish: 'published',
	unpublish: 'unpublished',
	schedule: 'scheduled',
	clone: 'cloned',
	test: 'testing'
};

// Create an empty writable store for modifyEntry
export const modifyEntry: Writable<(status: keyof typeof statusMap) => Promise<void>> = writable();

//  Store ListboxValue
export const storeListboxValue: Writable<string> = writable('create');

// Store image data while editing
export const file = writable<File | null>(null);
export const saveEditedImage: Writable<boolean> = writable(false);

// Languages
// Create a writable store for contentLanguage with initial value of PublicEnv.DEFAULT_CONTENT_LANGUAGE
export const contentLanguage: Writable<string> = writable(publicEnv.DEFAULT_CONTENT_LANGUAGE);

// Create a writable store for systemLanguage with initial value of PublicEnv.DEFAULT_SYSTEM_LANGUAGE
export const systemLanguage: Writable<AvailableLanguageTag> = writable(publicEnv.DEFAULT_SYSTEM_LANGUAGE) as any;

// Set the language tag
export const messages: Writable<typeof m> = writable({ ...m });
systemLanguage.subscribe((val) => {
	setLanguageTag(val);
	messages.set({ ...m });
});

// Content Translation Completion Status
export const translationStatus = writable({});
export const completionStatus = writable(0);

// TranslationStatus.svelte modal
export const translationStatusOpen = writable(false);
export const translationProgress: Writable<{ [key: string]: { total: Set<any>; translated: Set<any> } } | { show: boolean }> = writable({
	show: false
});

// Tab skeleton store
export const tabSet: Writable<number> = writable(0);

// Cancel/Reload HeaderButton
export const headerActionButton: Writable<boolean> = writable(true);
export const headerActionButton2: Writable<ConstructorOfATypedSvelteComponent | string> = writable();
export const drawerExpanded: Writable<boolean> = writable(true);

// Create a writable store for Avatar
export const avatarSrc: Writable<string> = writable();

// Git Version check
export const pkgBgColor = writable('variant-filled-primary');

// loading indicator
export const loadingProgress = writable(0);
export const isLoading: Writable<boolean> = writable(false);

// MegaMenu Save Layer Store & trigger
export const saveFunction: Writable<{ fn: (args: any) => any; reset: () => any }> = writable({ fn: () => {}, reset: () => {} });
export const saveLayerStore = writable(async () => {});
export const shouldShowNextButton = writable(false);

export const tableHeaders = ['_id', 'email', 'username', 'role', 'createdAt'] as const;

// Widget store

// Define the interface for validation errors
interface ValidationErrors {
	[fieldName: string]: string | null;
}

// Create a writable store for validation errors
export const validationStore = (() => {
	const { subscribe, update } = writable<ValidationErrors>({});

	const setError = (fieldName: string, errorMessage: string | null) => {
		update((errors) => ({ ...errors, [fieldName]: errorMessage }));
	};

	const clearError = (fieldName: string) => {
		update((errors) => {
			const { [fieldName]: _, ...rest } = errors;
			return rest;
		});
	};

	const getError = (fieldName: string) => {
		let error: string | null = null;
		subscribe((errors) => {
			error = errors[fieldName] || null;
		})();
		return error;
	};

	const hasError = (fieldName: string) => {
		let hasError = false;
		subscribe((errors) => {
			hasError = !!errors[fieldName];
		})();
		return hasError;
	};

	return {
		subscribe,
		setError,
		clearError,
		getError,
		hasError
	};
})();
