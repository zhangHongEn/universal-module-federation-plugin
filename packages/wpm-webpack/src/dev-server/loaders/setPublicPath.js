var _system_context__, _system_context__$met, _system_context__$met2, _system_context__$met3;

const src = (_system_context__ = __system_context__) === null || _system_context__ === void 0 ? void 0 : (_system_context__$met = _system_context__.meta) === null || _system_context__$met === void 0 ? void 0 : (_system_context__$met2 = _system_context__$met.url) === null || _system_context__$met2 === void 0 ? void 0 : (_system_context__$met3 = _system_context__$met2.match) === null || _system_context__$met3 === void 0 ? void 0 : _system_context__$met3.call(_system_context__$met2, /(.+\/)[^/]+\.js(\?.*)?$/);

if (src) {
  __webpack_public_path__ = src[1]; // eslint-disable-line
}
