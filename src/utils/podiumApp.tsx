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
  document.head.appendChild(script); // end of head means all the podiumApp scripts run first, but they don't start initializing (in theory if mygann+ loaded slowly they might, so always make sure it works even if mygann+ loads after initializing podiumApp)
  script.remove(); // no need to clutter up the DOM with these script tags
}
