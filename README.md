# ECommerceApplication

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

Our application is an online store. This project is educational and was created as part of the Frontend development course at RS SCHOOL. However, if desired, this project can be further developed into a fully functional commercial online store.

The application is powered by [commerce API](https://commercetools.com/), a leading provider of commerce solutions for B2C and B2B enterprises.
        
## Development server

To start a local development server, run:

```bash
ng serve
```
or

```bash
npm start
```
Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Running ESLint and Prettier

This script runs a code check using ESLint for files with the .ts extension (TypeScript). It analyzes the code for compliance with coding rules specified in the ESLint configuration and helps identify potential errors or deviations from standards. Use the following command:

```bash
npm run lint
```

format
This script automatically formats all files in the project using Prettier. It applies predefined formatting rules (e.g., indentation, quotes, semicolons) and overwrites the original files with proper formatting. Use the following command:

```bash
npm run format
```

This script checks whether the files in the project comply with Prettier's formatting rules but does not modify them. If any files do not meet the formatting standards, the script will list them. This is useful for verifying formatting before committing changes. Use the following command:

```bash
npm run format:check
```

format:check:all
This script is similar to format:check, but it additionally ignores files with unknown extensions (e.g., if they are not supported by Prettier). This allows for a more comprehensive check of all files in the project without errors caused by unsupported file types. Use the following command:

```bash
npm run format:check:all
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```
or
```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```
or
```bash
npm run test-ng
```
To execute unit tests with the [Jest](https://jestjs.io/) test runner, use the following command:

```bash
npm run test
```

This script runs tests in watch mode. Jest will automatically monitor changes in project files and rerun tests whenever you save them. This is convenient for developers as it allows you to quickly verify the correctness of your code while working, use the following command:

```bash
npm run test:watch
```
This script generates a test coverage report. Jest analyzes what percentage of your code is covered by tests and provides detailed information in the form of a text or HTML report. This is useful for ensuring the quality of testing and identifying parts of the code that are not covered by tests, use the following command:

```bash
npm run test:coverage
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
