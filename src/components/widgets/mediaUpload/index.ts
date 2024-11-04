/**
@file src/components/widgets/mediaUpload/index.ts
@description - mediaUpload index file.
*/

const WIDGET_NAME = 'MediaUpload' as const; // Defines MediaUpload widget Parameters

// import type { MediaFile } from '@utils/types';
import { getFieldName, getGuiFields, get_elements_by_id, meta_data } from '@utils/utils';
import { saveMedia, deleteMedia } from '@utils/media';
import { type Params, GuiSchema, GraphqlSchema } from './types';
import { type ModifyRequestParams } from '..';
import { dbAdapter } from '@src/databases/db';

// ParaglideJS
import * as m from '@src/paraglide/messages';

const widget = (params: Params) => {
	// Define the display function
	let display: any;

	if (!params.display) {
		display = async ({ data }) => {
			// console.log(data);

			// Return the formatted data
			let url = data?.thumbnail?.url;

			if (data instanceof FileList) {
				url = URL.createObjectURL(data[0]);
			} else if (data instanceof File) {
				url = URL.createObjectURL(data);
			}

			switch (params.type) {
				case 'video':
					return `<video class='max-w-[200px] inline-block' src="${url}" controls></video>`;
				case 'audio':
					return `<audio class='max-w-[200px] inline-block' src="${url}" controls></audio>`;
				case 'document':
					return `<a class='max-w-[200px] inline-block' href="${url}" target="_blank">${data?.name || 'Document'}</a>`;
				default:
					return `<img class='max-w-[200px] inline-block' src="${url}" />`;
			}
		};
		display.default = true;
	}

	// Define the widget object
	const widget = {
		Name: WIDGET_NAME,
		GuiFields: getGuiFields(params, GuiSchema)
	};

	// Define the field object
	const field = {
		// default fields
		display,
		label: params.label,
		db_fieldName: params.db_fieldName,
		translated: params.translated,
		required: params.required,
		icon: params.icon,
		width: params.width,
		helper: params.helper,

		// permissions
		permissions: params.permissions,

		// extras
		folder: params.folder || 'unique',
		multiupload: params.multiupload,
		sizelimit: params.sizelimit,
		extensions: params.extensions,
		metadata: params.metadata,
		tags: params.tags,
		categories: params.categories,
		responsive: params.responsive,
		customDisplayComponent: params.customDisplayComponent,
		watermark: {
			url: params.watermark?.url,
			position: params.watermark?.position,
			opacity: params.watermark?.opacity,
			scale: params.watermark?.scale,
			offsetX: params.watermark?.offsetX,
			offsetY: params.watermark?.offsetY,
			rotation: params.watermark?.rotation
		}
	};

	// Return the field and widget objects
	return { ...field, widget };
};

// Assign Name, GuiSchema and GraphqlSchema to the widget function
widget.Name = WIDGET_NAME;
widget.GuiSchema = GuiSchema;
widget.GraphqlSchema = GraphqlSchema;
widget.toString = () => '';

// Widget icon and helper text
widget.Icon = 'material-symbols:image-outline';
widget.Description = m.widget_ImageUpload_description();

widget.modifyRequest = async ({ data, type, collection, id }: ModifyRequestParams<typeof widget>) => {
	const _data = data.get() as File;
	let _id: any;

	switch (type) {
		case 'GET':
			// here _data is just id of the image
			data.update(null);
			get_elements_by_id.add('media_files', _data, (newData) => data.update(newData));
			break;
		case 'POST':
		case 'PATCH':
			if (_data instanceof File) {
				_id = (await saveFile(_data, collection.modelName, dbAdapter)).id;
				data.update(_id);
			} else if (_data?._id) {
				// chosen image from _media_images
				_id = _data._id;
				data.update(_id);
			}
			if (meta_data?.media_files?.removed && _id) {
				const removed = meta_data?.media_files?.removed as string[];
				let index = removed.indexOf(_id.toString());
				while (index != -1) {
					removed.splice(index, 1);
					index = removed.indexOf(_id.toString());
				}
			}
			await dbAdapter.updateOne('media_files', { _id }, { $addToSet: { used_by: id } });
			break;
		case 'DELETE':
			await dbAdapter.updateMany('media_files', {}, { $pull: { used_by: id } });
			break;
	}
};

// Widget Aggregations
widget.aggregations = {
	filters: async (info) => {
		const field = info.field as ReturnType<typeof widget>;
		return [
			{
				$match: {
					[`${getFieldName(field)}.header.${info.contentLanguage}`]: {
						$regex: info.filter,
						$options: 'i'
					}
				}
			}
		];
	},
	sorts: async (info) => {
		const field = info.field as ReturnType<typeof widget>;
		const fieldName = getFieldName(field);
		return [{ $sort: { [`${fieldName}.original.name`]: info.sort } }];
	}
} as Aggregations;

// Export FieldType interface and widget function
export interface FieldType extends ReturnType<typeof widget> {}
export default widget;