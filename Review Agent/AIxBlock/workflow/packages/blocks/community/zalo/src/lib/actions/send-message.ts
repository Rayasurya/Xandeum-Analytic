import { createAction } from 'workflow-blocks-framework';

export const sendMessage = createAction({
  name: 'sendMessage',
  displayName: 'send message',
  description: 'send message',
  props: {},
  async run() {
    // Action logic here
  },
});
