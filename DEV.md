# Vanilla JS Online Payments Client SDK Example

## Shared styles

All styling shared among examples is located in the separate folder `design`. It contains a folder for
static files and a folder for SASS styles. There are scripts that will automatically copy these styles to the
appropriate example folder. Check the `examples/vanilla-js/package.json` for an example script.

When starting the application, the script will start watching the design folder and will automatically
compile and copy the CSS.

## Development rules

When developing this example application, you need to follow some rules:

- Each public method MUST have JSDoc.
- All types MUST be annotated.
- Enable linter in your IDE and set it to run on file change.
- Follow the given folder structure (which should be self-explanatory)
