import { api } from '@/lib/api';
import {
    CreateTodoCommentRequestBody,
    ListTodoCommentsQueryParams,
    TodoComment,
    TodoCommentWithUser,
} from 'workflow-axb-shared';
import { SeekPage } from 'workflow-shared';

export const todoCommentApi = {
  async list(todoId: string, request: ListTodoCommentsQueryParams) {
    return await api.get<SeekPage<TodoCommentWithUser>>(
      `/v1/todos/${todoId}/comments`,
      request,
    );
  },
  async create(todoId: string, requestBody: CreateTodoCommentRequestBody) {
    return await api.post<TodoComment>(
      `/v1/todos/${todoId}/comments`,
      requestBody,
    );
  },
};
