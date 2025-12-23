import { HttpError, HttpMethod } from 'workflow-blocks-common';
import { createAction } from 'workflow-blocks-framework';
import { isNil } from 'workflow-shared';
import { jiraCloudAuth } from '../../auth';
import { jiraApiCall } from '../common';
import { issueIdOrKeyProp, issueLinkTypeIdProp } from '../common/props';

export const linkIssuesAction = createAction({
	auth: jiraCloudAuth,
	name: 'link-issues',
	displayName: 'Link Issues',
	description: 'Creates a link between two issues.',
	props: {
		firstIssueId: issueIdOrKeyProp('First Issue', true),
		issueLinkTypeId: issueLinkTypeIdProp('Link Type', true),
		secondIssueId: issueIdOrKeyProp('Second Issue', true),
	},
	async run(context) {
		const { firstIssueId, issueLinkTypeId, secondIssueId } = context.propsValue;

		if (isNil(firstIssueId) || isNil(issueLinkTypeId) || isNil(secondIssueId)) {
			throw new Error('First Issue, Link Type, and Second Issue are required');
		}
		try {
			const response = await jiraApiCall({
				method: HttpMethod.POST,
				resourceUri: '/issueLink',
				auth: context.auth,
				body: {
					type: {
						id: issueLinkTypeId,
					},
					inwardIssue: {
						id: secondIssueId,
					},
					outwardIssue: {
						id: firstIssueId,
					},
				},
			});

			return { success: true };
		} catch (e) {
			return { success: false, error: (e as HttpError).message };
		}
	},
});
