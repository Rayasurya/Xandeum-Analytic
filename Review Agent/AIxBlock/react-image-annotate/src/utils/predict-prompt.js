export function getPrompt(projectId, defaultPrompts) {
  const ls = localStorage.getItem(`ria-project-${projectId}-prompt`);

  return ls && ls.length > 0 ? ls : defaultPrompts;
}

export function setPrompt(projectId, prompts) {
  localStorage.setItem(`ria-project-${projectId}-prompt`, prompts);
}