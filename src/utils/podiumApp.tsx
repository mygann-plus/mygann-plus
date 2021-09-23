/* eslint-disable no-console */
import { createElement } from '~/utils/dom';

// export interface podiumApp {
//   module: (name: string) => any;
// }
// type p3function = (podiumApp: podiumApp) => void;

// runs code body in script so it can access p3/podiumApp variables. Escape to add outside variables, not they will be converted to string
export default function runWithPodiumApp(body: string) {
  const script = (
    <script>
      {/* ({f})(p3); // old, back when this took a function as a parameter */}
      {/* runs in a function so that it doesn't affect global states/variables */}
      {/* escape things are curly braces */}
      (function () &#123;
        {body}
      &#125;());
    </script>
  );
  console.log(script);
  document.head.appendChild(script);
}
