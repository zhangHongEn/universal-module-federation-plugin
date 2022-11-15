
/**
 * Injects refresh loader to all JavaScript-like and user-specified files.
 * @param {*} moduleData Module factory creation data.
 * @param {InjectLoaderOptions} injectOptions Options to alter how the loader is injected.
 * @returns {*} The injected module factory creation data.
 */
 function injectLoader(moduleData, injectOptions, resolvedLoader) {
  const { match, options } = injectOptions;
  if (
    match(moduleData) &&
    // Exclude files referenced as assets
    !moduleData.type.includes('asset')
  ) {
    // As we inject runtime code for each module,
    // it is important to run the injected loader after everything.
    // This way we can ensure that all code-processing have been done,
    // and we won't risk breaking tools like Flow or ESLint.
    moduleData.loaders.unshift({
      loader: resolvedLoader,
      options,
    });
  }

  return moduleData;
}

module.exports = injectLoader;
