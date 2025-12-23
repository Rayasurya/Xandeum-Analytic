## Building

Run `nx build blocks-assemblyai` to build the library.

## Generating props

- Copy `assemblyai.env.sample` to `assemblyai.env`
- In `assemblyai.env`, update the `OPENAPI_SPEC_LOCATION` variable to the path or URL of AssemblyAI's OpenAPI spec
- Run `nx generate-params pieces-assemblyai`

You can find [AssemblyAI's OpenAPI spec on GitHub](https://github.com/AssemblyAI/assemblyai-api-spec/blob/main/openapi.yml).
