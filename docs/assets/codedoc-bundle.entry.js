import { getRenderer } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/transport/renderer.js';
import { initJssCs } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/transport/setup-jss.js';initJssCs();
import { installTheme } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/content/theme.ts';installTheme();
import { codeSelection } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/selection.js';codeSelection();
import { sameLineLengthInCodes } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/same-line-length.js';sameLineLengthInCodes();
import { initHintBox } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/line-hint/index.js';initHintBox();
import { initCodeLineRef } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/line-ref/index.js';initCodeLineRef();
import { initSmartCopy } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/smart-copy.js';initSmartCopy();
import { copyHeadings } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/heading/copy-headings.js';copyHeadings();
import { contentNavHighlight } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/contentnav/highlight.js';contentNavHighlight();
import { loadDeferredIFrames } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/transport/deferred-iframe.js';loadDeferredIFrames();
import { smoothLoading } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/transport/smooth-loading.js';smoothLoading();
import { tocHighlight } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/toc-highlight.js';tocHighlight();
import { postNavSearch } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/search/post-nav/index.js';postNavSearch();
import { copyLineLinks } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/line-links/copy-line-link.js';copyLineLinks();
import { gatherFootnotes } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/footnote/gather-footnotes.js';gatherFootnotes();
import { ToCPrevNext } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/prevnext/index.js';
import { GithubSearch } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/misc/github/search.js';
import { ToCToggle } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/toggle/index.js';
import { DarkModeSwitch } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/darkmode/index.js';
import { ConfigTransport } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/transport/config.js';
import { TabSelector } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/tabs/selector.js';
import { CollapseControl } from '/Users/gsuaki/Workspace/gsuaki/dev-blog/.codedoc/node_modules/@codedoc/core/dist/es6/components/collapse/collapse-control.js';

const components = {
  '1oDgJDiRw4TmJK8Nx8OQvg==': ToCPrevNext,
  'ru+4DBZm59n9LApsF0epkg==': GithubSearch,
  'xCCwMng3sUXOBSbNUfPJwg==': ToCToggle,
  'wzI3Lgba0Hrug0NekmZEmA==': DarkModeSwitch,
  'Zgw1otLEif/C2lvynSMtgg==': ConfigTransport,
  'rvsLPtYnlIMAmgESuI2yRQ==': TabSelector,
  'aez7ZX/+IsorXOaeGKGDlQ==': CollapseControl
};

const renderer = getRenderer();
const ogtransport = window.__sdh_transport;
window.__sdh_transport = function(id, hash, props) {
  if (hash in components) {
    const target = document.getElementById(id);
    renderer.render(renderer.create(components[hash], props)).after(target);
    target.remove();
  }
  else if (ogtransport) ogtransport(id, hash, props);
}
