'use strict';

import fs from 'fs';
import { getOptions } from 'loader-utils';
import printFlowDefinition from 'css-modules-flow-types-printer';

function getTokens(content) {
  const tokens = [];

  // Only `locals` export is desired
  const locals = content.match(/exports\.locals = ([\s\S]*);/);

  if (!locals) return tokens;
  let match;

  // RegExp.exec is state-full, so we need to initialize new one for each run
  const re = /"(.*?)":.*\n/g;
  while ((match = re.exec(locals[1])) !== null) tokens.push(match[1]);

  return tokens;
}

module.exports = function cssModulesFlowTypesLoader(content) {
  const tokens = getTokens(content);
  const options = getOptions(this);

  // NOTE: We cannot use .emitFile as people might use this with devServer
  // (e.g. in memory storage).

  const outputPath = options && options.path
    ? options.path + '/' + this.resourcePath + '.flow'
    : this.resourcePath + '.flow';
  fs.writeFile(outputPath, printFlowDefinition(tokens), {}, function() {});

  return content;
};
