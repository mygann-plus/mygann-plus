import { createElement } from '~/utils/dom';
import log from '~/utils/log';

// runs code body in script so it can access p3/podiumApp variables. Escape to add outside variables, not they will be converted to string
// export default function runWithPodiumApp(body: string) {
export default function runWithPodiumApp(f: (window: any) => void) {
  const script = (
    <script className=".mygannplus-script">
      {/* runs in a function so that it doesn't affect global states/variables */}
      {/* ({f})(window, {params.map(s => `'${s}'`).join(',')}); */}
      ({f})(window);
    </script>
  );
  log('log', script);
  document.head.appendChild(script);
  script.remove(); // no need to clutter up the DOM with these script tags
}
