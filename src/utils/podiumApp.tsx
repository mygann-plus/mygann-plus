import { createElement } from '~/utils/dom';

// runs code body in script so it can access p3/podiumApp variables. Escape to add outside variables, not they will be converted to string
// export default function runWithPodiumApp(body: string) {
export default function runWithPodiumApp(f: (p3: any, ...params: string[]) => void, ...params: string[]) {
  const script = (
    <script className=".mygannplus-script">
      {/* runs in a function so that it doesn't affect global states/variables */}
      {/* escape things are curly braces */}
      {/* (function () &#123;
        {body}
      &#125;()); */}
      ({f}(p3, {params.map(s => `'${s}'`).join(',')}));
    </script>
  );
  console.log(script);
  document.head.appendChild(script);
  // script.remove(); // no need to clutter up the DOM with these script tags
}
