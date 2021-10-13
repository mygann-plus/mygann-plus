import { createElement } from '~/utils/dom';
import log from '~/utils/log';

// script body if a function needs further parameters: ({f})(window, {params.map(s => `'${s}'`).join(',')});

// runs a function in the global scope (with the podiumApp)
export default function runWithPodiumApp(f: (window: any) => void) {
  const script = (
    <script className=".mygannplus-script">
      ({f})(window);
    </script>
  );
  log('log', script);
  document.head.appendChild(script);
  script.remove(); // no need to clutter up the DOM with these script tags
}
